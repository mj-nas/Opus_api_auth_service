/* eslint-disable prettier/prettier */
import { Seed } from '@core/sql/seeder/seeder.dto';
import { User } from '../../modules/sql/user/entities/user.entity';

export default <Seed<Omit<User, 'role'>>>{
  model: 'User',
  action: 'once',
  data: [
    {
      role: 'Admin',
      first_name: 'Super',
      last_name: 'Admin',
      email: 'opus@mailinator.com',
      phone_code: '+1',
      phone: '9999999999',
      password: '123456',
    },
    {
      role: 'Customer',
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test.customer@mailinator.com',
      phone_code: '+1',
      phone: '9999999998',
      password: '123456',
    },
    {
      role: 'Dispenser',
      first_name: 'Test',
      last_name: 'Dispenser',
      email: 'test.dispenser@mailinator.com',
      phone_code: '+1',
      phone: '9999999998',
      password: '123456',
    },
  ],
};
