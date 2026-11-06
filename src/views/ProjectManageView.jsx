import React, { useState } from 'react';

export default function ProjectManageView({ projects, onSaveProject, currentUser }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [name, setName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [supervisorName, setSupervisorName] = useState(currentUser?.nickname || '');
  const [floorName, setFloorName] = useState('');
  const [floorFile, setFloorFile] = useState(null);
  const [tempPlans, setTempPlans] = useState([]);

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingProjectId(null);
    setName('');
    setManagerEmail('');
    setSupervisorName(currentUser?.nickname || '');
    setFloorName('');
    setFloorFile(null);
    setTempPlans([]);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProjectId(proj.id);
    setName(proj.name);
    setManagerEmail(proj.managerEmail);
    setSupervisorName(proj.supervisorName);
    setTempPlans(proj.plans || []);
    setIsFormOpen(true);
  };

  const handleFloorFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFloorFile(e.target.files[0]);
    }
  };

  const handleAddTempFloor = () => {
    if (!floorName.trim()) {
      alert('층수(예: 1층)를 먼저 입력해주세요.');
      return;
    }
    if (!floorFile) {
      alert('도면 이미지 파일을 선택해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempPlans((prev) => [
        ...prev,
        { floor: floorName.trim(), url: reader.result, filename: floorFile.name },
      ]);
      setFloorName('');
      setFloorFile(null);
      const inputEl = document.getElementById('floor-file-input');
      if (inputEl) inputEl.value = '';
    };
    reader.readAsDataURL(floorFile);
  };

  const handleRemoveTempFloor = (index) => {
    setTempPlans((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('현장명을 입력해주세요.');
      return;
    }
    if (!supervisorName.trim()) {
      alert('공사감독자 성명을 입력해주세요.');
      return;
    }

    onSaveProject({
      id: editingProjectId || Date.now(),
      name: name.trim(),
      managerEmail: managerEmail.trim() || 'site_manager@example.com',
      supervisorName: supervisorName.trim(),
      plans: tempPlans,
    });

    alert(
      editingProjectId
        ? `[${name}] 현장 정보가 수정되었습니다.`
        : `[${name}] 신규 현장 등록이 완료되었습니다.`
    );
    resetForm();
  };

  return (
    <div style={{ padding: '20px' }}>
      {!isFormOpen && (
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h2 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>등록된 현장 목록</h2>
            <button
              onClick={handleOpenCreate}
              style={{
                padding: '6px 12px',
                backgroundColor: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              + 새 현장 등록
            </button>
          </div>

          {projects.map((proj) => (
            <div
              key={proj.id}
              style={{
                backgroundColor: '#fff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800' }}>{proj.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  감독관: {proj.supervisorName} | 도면 {proj.plans?.length || 0}건
                </div>
              </div>
              <button
                onClick={() => handleOpenEdit(proj)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                수정
              </button>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '800',
              color: '#4f46e5',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '8px',
            }}
          >
            {editingProjectId ? '기존 현장 정보 수정' : '새 현장 정보 입력'}
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700' }}>공사 현장명 *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                marginTop: '6px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700' }}>
              공사감독자 성명 * (서명용)
            </label>
            <input
              type="text"
              required
              placeholder="예: 홍길동"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                marginTop: '6px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700' }}>현장 소장 이메일</label>
            <input
              type="email"
              placeholder="site_manager@example.com"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                marginTop: '6px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
            }}
          >
            <label
              style={{
                fontSize: '13px',
                fontWeight: '700',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              층별 도면 사전 업로드
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="층수 (예: 1층)"
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
                style={{
                  width: '80px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                }}
              />
              <input
                type="file"
                id="floor-file-input"
                accept="image/*"
                onChange={handleFloorFileChange}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                }}
              />
              <button
                type="button"
                onClick={handleAddTempFloor}
                style={{
                  padding: '10px',
                  backgroundColor: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                + 추가
              </button>
            </div>

            {tempPlans.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {tempPlans.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#eef2ff',
                      border: '1px solid #c7d2fe',
                      padding: '8px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5' }}>
                        [{p.floor}]
                      </span>
                      <span style={{ fontSize: '11px', color: '#475569' }}>
                        {p.filename || '기존 도면 유지'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTempFloor(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={resetForm}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#e2e8f0',
                color: '#475569',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '14px',
                backgroundColor: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {editingProjectId ? '수정 사항 저장' : '현장 등록 완료'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
