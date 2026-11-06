import React, { useState, useRef } from 'react';
import A4ReportDocument, { getIssueSummary } from '../components/A4ReportDocument';
import { usePdfGenerator } from '../hooks/usePdfGenerator';
import { sendIssueEmail } from '../api';

export default function LedgerView({ issues, projects, onUpdateIssue }) {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const printDocRef = useRef(null);

  const { isGeneratingPdf, generateA4Pdf, downloadPdf } = usePdfGenerator();

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setIsEditing(false);
    setEditContent(issue.content || '');
    setEditSummary(getIssueSummary(issue));
  };

  const handleBackToList = () => {
    setSelectedIssue(null);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!selectedIssue) return;
    const updated = {
      ...selectedIssue,
      summary: editSummary.trim(),
      content: editContent.trim(),
    };
    onUpdateIssue(updated);
    setSelectedIssue(updated);
    setIsEditing(false);
  };

  const handleDownloadPdf = async () => {
    if (!printDocRef.current || !selectedIssue) return;
    const datePrefix = selectedIssue.createdAt ? selectedIssue.createdAt.substring(0, 10) : '';
    const filename = `공사감독일지_${selectedIssue.projectName}_${datePrefix}.pdf`;
    await downloadPdf(printDocRef.current, filename);
  };

  const handleSendEmailWithPdf = async () => {
    if (!selectedIssue || !printDocRef.current) return;

    const proj = projects.find((p) => p.id === selectedIssue.projectId);
    const targetEmail = proj?.managerEmail || '현장소장 메일';

    if (
      !window.confirm(
        `[${targetEmail}]\n위 주소로 A4 공사감독일지(PDF)를 첨부하여 공식 발송하시겠습니까?`
      )
    ) {
      return;
    }

    setIsSendingEmail(true);

    try {
      const pdf = await generateA4Pdf(printDocRef.current);
      if (!pdf) {
        alert('PDF 생성에 실패하여 메일을 발송할 수 없습니다.');
        return;
      }

      const pdfBase64 = pdf.output('datauristring');

      const resData = await sendIssueEmail({
        toEmail: targetEmail,
        projectName: selectedIssue.projectName,
        date: selectedIssue.createdAt,
        category: selectedIssue.category,
        summary: getIssueSummary(selectedIssue),
        content: selectedIssue.content,
        pdfBase64: pdfBase64,
      });

      if (resData.success) {
        const updated = { ...selectedIssue, isSent: true };
        onUpdateIssue(updated);
        setSelectedIssue(updated);

        let successMsg = `[발송 완료]\n공사감독일지 PDF 첨부파일이 현장소장(${targetEmail})에게 성공적으로 전송되었습니다.`;
        if (resData.previewUrl) {
          successMsg += `\n\n(가상 테스트 메일이 발송되었습니다. 콘솔 또는 미리보기 URL에서 확인 가능합니다)\n${resData.previewUrl}`;
        }
        alert(successMsg);
      } else {
        alert(`발송 실패: ${resData.error || resData.message || '서버 오류'}`);
      }
    } catch (err) {
      console.error('메일 전송 통신 오류:', err);
      alert(`메일 전송 오류: ${err.message || '백엔드 서버 통신 실패'}\n(백엔드 서버가 켜져 있는지 확인해주세요)`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 1. 목록 화면
  if (!selectedIssue) {
    return (
      <div style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px' }}>
          등록된 지적 목록
        </h2>
        {issues.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            등록된 지적사항이 없습니다.
          </div>
        ) : (
          issues.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectIssue(item)}
              style={{
                backgroundColor: '#fff',
                padding: '16px',
                borderRadius: '16px',
                marginBottom: '12px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#4338ca',
                    backgroundColor: '#e0e7ff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {item.category}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: item.isSent ? '#059669' : '#d97706',
                  }}
                >
                  {item.isSent ? '발송완료' : '미발송'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '800' }}>
                {item.projectName}
              </h4>
              <div style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748b' }}>
                {item.createdAt} 등록건
              </div>
              <div
                style={{
                  margin: '0 0 4px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#1e293b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {getIssueSummary(item)}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '11.5px',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.content}
              </p>
            </div>
          ))
        )}
      </div>
    );
  }

  // 2. 상세 / A4 일지 뷰
  return (
    <div style={{ padding: '14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <button
          onClick={handleBackToList}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ◀ 목록
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                fontSize: '11px',
                fontWeight: '700',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              문구 수정 ✏️
            </button>
          )}
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>
            A4 (210×297)
          </span>
        </div>
      </div>

      {isEditing && (
        <div
          style={{
            marginBottom: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#4f46e5',
                marginBottom: '4px',
                display: 'block',
              }}
            >
              ■ 주요 업무 (한 줄 요약)
            </label>
            <input
              type="text"
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              placeholder="예: [안전 관리] 용접 작업 화재예방 안전조치 미이행에 따른 작업 중지 및 시정 지시"
              style={{
                width: '100%',
                padding: '8px',
                boxSizing: 'border-box',
                fontSize: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#4f46e5',
                marginBottom: '4px',
                display: 'block',
              }}
            >
              ■ 업무 내용 및 지시사항 (상세)
            </label>
            <textarea
              rows="4"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                boxSizing: 'border-box',
                fontSize: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                lineHeight: '1.5',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={handleSaveEdit}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              변경사항 저장
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '8px 14px',
                backgroundColor: '#94a3b8',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* A4 공사감독일지 출력 템플릿 컴포넌트 */}
      <A4ReportDocument ref={printDocRef} issue={selectedIssue} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#334155',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
          }}
        >
          {isGeneratingPdf ? 'PDF 변환 중...' : '📥 A4 규격 PDF 미리보기 / 다운로드'}
        </button>

        <button
          onClick={handleSendEmailWithPdf}
          disabled={isGeneratingPdf || isSendingEmail}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: isSendingEmail ? '#0284c7' : selectedIssue.isSent ? '#64748b' : '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '800',
            cursor: isGeneratingPdf || isSendingEmail ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
          }}
        >
          {isSendingEmail
            ? '⏳ PDF 생성 및 이메일 전송 중...'
            : selectedIssue.isSent
            ? '✓ 현장소장에게 이미 발송됨 (PDF 재발송)'
            : '📨 소장에게 A4 PDF 첨부하여 공식 발송'}
        </button>
      </div>
    </div>
  );
}
