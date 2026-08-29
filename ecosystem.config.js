module.exports = {
  apps: [
    {
      name: 'synova-backend',
      cwd: './apps/backend',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      interpreter: 'none',
      env: {
        ENVIRONMENT: 'production',
      },
    },
    {
      name: 'synova-automation',
      cwd: './apps/automation-service',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8001',
      interpreter: 'none',
      env: {
        ENVIRONMENT: 'production',
      },
    },
    {
      name: 'synova-insurer-a',
      cwd: './apps/mock-insurers/insurer-a',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 9001',
      interpreter: 'none',
    },
    {
      name: 'synova-insurer-b',
      cwd: './apps/mock-insurers/insurer-b',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 9002',
      interpreter: 'none',
    },
    {
      name: 'synova-insurer-c',
      cwd: './apps/mock-insurers/insurer-c',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 9003',
      interpreter: 'none',
    },
    {
      name: 'synova-insurer-d',
      cwd: './apps/mock-insurers/insurer-d',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 9004',
      interpreter: 'none',
    },
    {
      name: 'synova-voice-agent',
      cwd: './apps/synova-voice-agent',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8011',
      interpreter: 'none',
      env: {
        ENVIRONMENT: 'production',
      },
    },
    {
      name: 'synova-frontend-preview',
      cwd: './apps/frontend',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 5173',
    },
  ],
};
