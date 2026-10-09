import request from 'supertest';
import app from '../../backend/src/app';

describe('Auth API Endpoints', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  it('should reject invalid registration data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'invalid-email',
      password: '123',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBeFalsy();
  });
});
