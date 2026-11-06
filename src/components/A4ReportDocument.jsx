import React, { forwardRef } from 'react';

const A4ReportDocument = forwardRef(({ issue }, ref) => {
  if (!issue) return null;

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #000000',
        padding: '16px',
        boxSizing: 'border-box',
        color: '#000000',
        fontFamily: '"Malgun Gothic", "맑은 고딕", -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontWeight: '800',
          fontSize: '20px',
          letterSpacing: '8px',
          padding: '8px 0 14px 0',
          borderBottom: '2px solid #000',
        }}
      >
        공 사 감 독 일 지
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11.5px',
          marginTop: '10px',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: '1px solid #000',
                padding: '6px',
                backgroundColor: '#f8fafc',
                fontWeight: '700',
                width: '22%',
                textAlign: 'center',
              }}
            >
              공 사 명
            </td>
            <td
              colSpan="3"
              style={{
                border: '1px solid #000',
                padding: '6px',
                fontWeight: '600',
              }}
            >
              {issue.projectName}
            </td>
          </tr>
          <tr>
            <td
              style={{
                border: '1px solid #000',
                padding: '6px',
                backgroundColor: '#f8fafc',
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              주요 업무
            </td>
            <td colSpan="3" style={{ border: '1px solid #000', padding: '6px' }}>
              [{issue.category}] 관련 현장 검측 및 시정 조치 지시
            </td>
          </tr>
          <tr>
            <td
              style={{
                border: '1px solid #000',
                padding: '6px',
                backgroundColor: '#f8fafc',
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              점 검 일
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '28%' }}>
              {issue.createdAt}
            </td>
            <td
              style={{
                border: '1px solid #000',
                padding: '6px',
                backgroundColor: '#f8fafc',
                fontWeight: '700',
                width: '22%',
                textAlign: 'center',
              }}
            >
              날씨(기온)
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '28%' }}>
              {issue.weather?.condition} (
              {issue.weather ? `${issue.weather.high} / ${issue.weather.low}℃` : '-'})
            </td>
          </tr>
          <tr>
            <td
              style={{
                border: '1px solid #000',
                padding: '6px',
                backgroundColor: '#f8fafc',
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              공사 감독자
            </td>
            <td
              colSpan="3"
              style={{
                border: '1px solid #000',
                padding: '4px 10px',
                textAlign: 'right',
                verticalAlign: 'middle',
                height: '38px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '700', marginRight: '4px' }}>
                  {issue.supervisorName || '공사감독관'}
                </span>
                <span style={{ fontSize: '11px' }}>(서명 또는 인)</span>
                {issue.supervisorName && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '-20px',
                      top: '-15px',
                      zIndex: 10,
                      fontFamily: '"Nanum Pen Script", cursive',
                      fontSize: '32px',
                      color: '#000',
                      transform: 'rotate(-5deg)',
                      pointerEvents: 'none',
                    }}
                  >
                    {issue.supervisorName}
                  </div>
                )}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan="4" style={{ border: '1px solid #000', padding: '10px' }}>
              <div style={{ fontWeight: '800', marginBottom: '6px', fontSize: '12px' }}>
                ■ 업무 내용 및 지시사항
              </div>
              <div style={{ lineHeight: '1.5', minHeight: '40px', whiteSpace: 'pre-wrap' }}>
                {issue.content}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan="4" style={{ border: '1px solid #000', padding: '10px' }}>
              <div style={{ fontWeight: '800', marginBottom: '8px', fontSize: '12px' }}>
                ■ 현장 사진 및 도면 위치
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '4px',
                    textAlign: 'center',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: '700',
                      marginBottom: '4px',
                      color: '#334155',
                    }}
                  >
                    - 지적 위치 ({issue.floor})
                  </div>
                  {issue.floorPlanUrl ? (
                    <div
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        height: '140px',
                        backgroundColor: '#f1f5f9',
                      }}
                    >
                      <img
                        src={issue.floorPlanUrl}
                        alt="도면"
                        crossOrigin="anonymous"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      {issue.pin && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${issue.pin.x}%`,
                            top: `${issue.pin.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '14px',
                            height: '14px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            border: '2px solid #fff',
                            boxShadow: '0 0 4px rgba(0,0,0,0.4)',
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#94a3b8',
                      }}
                    >
                      도면 미첨부
                    </div>
                  )}
                </div>

                <div
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '4px',
                    textAlign: 'center',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: '700',
                      marginBottom: '4px',
                      color: '#334155',
                    }}
                  >
                    - 현장 사진
                  </div>
                  {issue.photoUrl ? (
                    <div
                      style={{
                        height: '140px',
                        overflow: 'hidden',
                        backgroundColor: '#f1f5f9',
                      }}
                    >
                      <img
                        src={issue.photoUrl}
                        alt="현장사진"
                        crossOrigin="anonymous"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#94a3b8',
                      }}
                    >
                      사진 미첨부
                    </div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

A4ReportDocument.displayName = 'A4ReportDocument';

export default A4ReportDocument;
