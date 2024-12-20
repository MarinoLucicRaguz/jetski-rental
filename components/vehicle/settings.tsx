'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/button';
import { updateUserDetails } from '@/actions/updateUser';
import { CardWrapper } from '../auth/card-wrapper';
import { FormError } from '../form-error';
import { FormSuccess } from '../form-success';
import { TextField } from '@mui/material';
import 'react-international-phone/style.css';
import { PhoneInput } from 'react-international-phone';
import { actionGetUserByEmail } from '@/actions/getUserByEmail';

const SettingsPage = () => {
  const user = useCurrentUser();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (user?.email) {
          const currentUser = await actionGetUserByEmail(user.email);
          if (currentUser?.contactNumber) {
            setPhone(currentUser.contactNumber);
          }
          if (currentUser?.name) {
            setName(currentUser.name);
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!user?.email) {
        throw new Error('User email not found');
      }

      const updateData: any = {
        email: user.email,
        name,
        phone,
      };

      if (currentPassword && newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const response = await updateUserDetails(updateData);

      if (response.error) {
        throw new Error(response.error);
      }

      setSuccess('Details updated successfully.');
      router.refresh();
    } catch (err) {
      setError('Failed to update details: ' + err);
    }
  };

  return (
    <CardWrapper headerLabel="My profile" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
      <div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <TextField label="Name" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          </div>
          <div className="mb-4">
            <PhoneInput
              defaultCountry="hr"
              autoFocus={true}
              onChange={(value) => {
                setPhone(value);
              }}
              value={phone}
              className={error ? 'border-red-500' : ''}
            />
          </div>
          <div className="mb-4">
            <TextField
              label="Current password"
              variant="outlined"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
          </div>
          <div className="mb-4">
            <TextField
              label="New password"
              variant="outlined"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
          </div>
          <Button className="mb-4 w-full" type="submit">
            Save Changes
          </Button>
        </form>
        <FormError message={error} />
        <FormSuccess message={success} />
      </div>
    </CardWrapper>
  );
};

export default SettingsPage;
