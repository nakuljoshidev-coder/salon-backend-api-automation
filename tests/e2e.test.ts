import request from 'supertest';

const baseURL = 'http://localhost:3000';

const salonId = '6aa641975d71ff9bf545c9a7';
const stylistId = '6aa641975d71ff9bf545c9a5';
const serviceId = '6aa641975d71ff9bf545c9a8';

describe('End-to-End Booking Flow', () => {
  it('should complete Register → Login → Booking → Cancel successfully', async () => {
    const email = `e2euser${Date.now()}@gmail.com`;
    const password = 'Test@123';

    // 1. Register
    const registerResponse = await request(baseURL)
      .post('/api/register')
      .send({
        name: 'E2E Test User',
        email,
        password,
      });

    expect([200, 201]).toContain(registerResponse.status);

    // 2. Login
    const loginResponse = await request(baseURL)
      .post('/api/login')
      .send({
        email,
        password,
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');

    const token = loginResponse.body.token;

    // 3. Create booking
    const bookingResponse = await request(baseURL)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        salonId,
        stylistId,
        serviceId,
        slotTime: '09:00',
        date: '2026-09-17',
      });

    expect([200, 201]).toContain(bookingResponse.status);
    expect(bookingResponse.body).toHaveProperty('booking');

    const bookingId = bookingResponse.body.booking._id;

    // 4. Cancel booking
    const cancelResponse = await request(baseURL)
      .post(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.body).toHaveProperty('message');
  });
});