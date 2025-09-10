import React from 'react';

export const SimpleApp: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#111827',
            margin: 0 
          }}>
            StudyFlow - Vietnamese Student Time Management
          </h1>
        </header>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#374151', marginBottom: '20px' }}>
            Welcome to Your Student Time Management Solution!
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '40px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '2px solid #3b82f6'
            }}>
              <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>📋 Task Management</h3>
              <p style={{ color: '#374151', fontSize: '14px' }}>
                Create, organize, and track your academic tasks with smart prioritization
              </p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '2px solid #10b981'
            }}>
              <h3 style={{ color: '#047857', marginBottom: '10px' }}>📅 Calendar View</h3>
              <p style={{ color: '#374151', fontSize: '14px' }}>
                Visualize deadlines and plan your study schedule effectively
              </p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#fef7ff',
              borderRadius: '8px',
              border: '2px solid #a855f7'
            }}>
              <h3 style={{ color: '#7c3aed', marginBottom: '10px' }}>📊 Analytics</h3>
              <p style={{ color: '#374151', fontSize: '14px' }}>
                Track productivity patterns and get AI-powered insights
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#fffbeb',
            borderRadius: '8px',
            border: '2px solid #f59e0b'
          }}>
            <h3 style={{ color: '#92400e', marginBottom: '15px' }}>
              🧠 Built for Vietnamese University Students
            </h3>
            <ul style={{ 
              textAlign: 'left',
              color: '#374151',
              fontSize: '14px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <li>Smart procrastination tracking learns your work patterns</li>
              <li>Handles academic deadlines, part-time work, and personal projects</li>
              <li>AI insights help you optimize your study schedule</li>
              <li>Works offline with persistent local storage</li>
              <li>Supports 20+ concurrent tasks without performance issues</li>
            </ul>
          </div>

          <button 
            style={{
              marginTop: '30px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
            onClick={() => window.location.reload()}
          >
            Loading Full Application...
          </button>
        </div>

        <footer style={{
          textAlign: 'center',
          marginTop: '40px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p>NAVER Vietnam AI Hackathon 2024 - Preliminary Assignment</p>
          <p style={{ marginTop: '5px' }}>
            A modern, AI-enhanced task management solution for Vietnamese students
          </p>
        </footer>
      </div>
    </div>
  );
};
