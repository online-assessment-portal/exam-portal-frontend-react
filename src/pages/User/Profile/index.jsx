import { Home, LogOut, Mail, Upload, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import Button from '../../../components/ui/Button.jsx';
import Message from '../../../components/ui/Message.jsx';
import { SYSTEM_MESSAGES } from '../../../constants/messages.js';
import { useAuth } from '../../../hooks';
import { notifications } from '../../../lib';
import { signOut } from '../../../services/auth.service.js';
import { updateProfile } from '../../../services/profile.service.js';
import '../../../styles/common/form.css';

const apiUrl = import.meta.env.VITE_API_URL;
const appEnv = import.meta.env.VITE_APP_ENV;
const isProd = appEnv === 'PROD';

const MAX_FILE_SIZE = 1048576; // 1MB
const DEFAULT_AVATAR = 'https://i.ibb.co/QpJYCQ7/UL8Ijh0w.png';
const IMAGE_UPLOAD_DISABLED = true; // TODO: Enable in future

const Profile = () => {
  // Hooks first
  const { userInfo, updateUserInfo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized values
  const from = useMemo(
    () => location.state?.from?.pathname || false,
    [location.state]
  );

  // State
  const [loading, setLoading] = useState({
    imageUpload: false,
    profileUpdate: false,
    logout: false,
  });

  const [formData, setFormData] = useState(() => ({
    name: userInfo?.name || '',
    uname: userInfo?.uname || '',
  }));

  const [initialFormData, setInitialFormData] = useState(() => ({
    name: userInfo?.name || '',
    uname: userInfo?.uname || '',
  }));

  const [fieldErrors, setFieldErrors] = useState({});

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const [profileImageSrc, setProfileImageSrc] = useState(
    () => userInfo?.img || DEFAULT_AVATAR
  );
  const [uploadLabelText, setUploadLabelText] = useState('Upload New Image');
  const [uploadButtonText, setUploadButtonText] = useState('Upload');
  const [showUploadButton, setShowUploadButton] = useState(false);

  // Memoized computed values
  const hasFormChanges = useMemo(
    () =>
      formData.name !== initialFormData.name ||
      formData.uname !== initialFormData.uname,
    [formData, initialFormData]
  );

  const isProcessing = useMemo(
    () => Object.values(loading).some(Boolean),
    [loading]
  );

  // Validation
  const validateField = useCallback((name, value) => {
    if (name === 'name') {
      if (!value.trim()) return 'Full name is required';
      if (value.length < 5) return 'Full name must be at least 5 characters';
      if (value.length > 30) return 'Full name must be less than 30 characters';
    }

    if (name === 'uname') {
      if (!value.trim()) return 'Username is required';
      if (value.length < 6) return 'Username must be at least 6 characters';
      if (value.length > 15) return 'Username must be less than 15 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return 'Username can only contain letters, numbers, and underscores';
      }
    }

    return '';
  }, []);

  // Event handlers
  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      setFormData((prev) => ({ ...prev, [name]: value }));

      const error = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));

      if (statusMessage.text) setStatusMessage({ type: '', text: '' });
    },
    [validateField, statusMessage.text]
  );

  const handleImageSelect = useCallback((event) => {
    const file = event.target.files?.[0];

    if (!file) {
      notifications.errorCustom('Image file was not loaded successfully.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      notifications.errorCustom(
        'File size is greater than 1MB. Please choose a smaller image.'
      );
      return;
    }

    const truncatedFileName =
      file.name.length <= 15
        ? file.name
        : file.name.slice(0, 5) + '***' + file.name.slice(-8);

    setUploadLabelText(truncatedFileName);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProfileImageSrc(e.target.result);
        setShowUploadButton(true);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageUpload = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading((prev) => ({ ...prev, imageUpload: true }));

      try {
        const formData = new FormData(event.target);
        const response = await fetch(`${apiUrl}/upload/img`, {
          method: 'POST',
          credentials: isProd ? 'same-origin' : 'include',
          headers: { 'csrf-token': userInfo.token },
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.url) {
          setShowUploadButton(false);
          setProfileImageSrc(result.url);
          notifications.successCustom('Image uploaded successfully!');
        } else {
          notifications.errorCustom(
            result.error?.message || 'Upload failed. Please try again.'
          );
        }
      } catch (error) {
        notifications.errorCustom(
          'Upload failed. Please check your internet connection.'
        );
      } finally {
        setLoading((prev) => ({ ...prev, imageUpload: false }));
      }
    },
    [userInfo.token]
  );

  const handleProfileUpdate = useCallback(
    async (event) => {
      event.preventDefault();

      const validationErrors = {};
      Object.keys(formData).forEach((key) => {
        const error = validateField(key, formData[key]);
        if (error) validationErrors[key] = error;
      });

      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setStatusMessage({
          type: 'error',
          text: 'Please fix the errors before submitting',
        });
        return;
      }

      setLoading((prev) => ({ ...prev, profileUpdate: true }));

      try {
        const profileFormData = new FormData();
        profileFormData.append('name', formData.name.trim());
        profileFormData.append('uname', formData.uname.trim());

        const {
          success,
          message: responseMessage,
          data,
        } = await updateProfile(profileFormData);

        if (success) {
          if (from) return navigate(from);

          setStatusMessage({
            type: 'success',
            text: 'Profile Updated Successfully',
          });
          setInitialFormData({ ...formData });
          setFieldErrors({});

          updateUserInfo(data.profile);
        } else {
          setStatusMessage({
            type: 'error',
            text: responseMessage || SYSTEM_MESSAGES.UNKNOWN_ERROR,
          });
        }
      } catch (error) {
        setStatusMessage({
          type: 'error',
          text: error?.message || SYSTEM_MESSAGES.UNKNOWN_ERROR,
        });
      } finally {
        setLoading((prev) => ({ ...prev, profileUpdate: false }));
      }
    },
    [formData, updateUserInfo, validateField, from, navigate]
  );

  const handleLogout = useCallback(async () => {
    setLoading((prev) => ({ ...prev, logout: true }));

    try {
      const { success, message } = await signOut();

      if (success) {
        logout();
        notifications.auth.logoutSuccess();
        navigate('/auth');
      } else {
        notifications.errorCustom(message || SYSTEM_MESSAGES.UNKNOWN_ERROR);
        setLoading((prev) => ({ ...prev, logout: false }));
      }
    } catch (error) {
      notifications.errorCustom(
        error?.message || SYSTEM_MESSAGES.UNKNOWN_ERROR
      );
      setLoading((prev) => ({ ...prev, logout: false }));
    }
  }, [navigate, logout]);

  // Effects
  useEffect(() => {
    document.title = 'Profile';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Shred Test</span>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              isLoading={loading.logout}
              loadingText="Signing out..."
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Profile Settings
          </h1>

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="relative mb-4">
              <img
                src={profileImageSrc}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
              />
            </div>

            {!IMAGE_UPLOAD_DISABLED ? (
              <form
                onSubmit={handleImageUpload}
                className="flex flex-col items-center gap-3 w-full max-w-xs"
              >
                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 sm:px-4 py-2 rounded-lg border border-blue-200 transition-all duration-200 text-sm sm:text-base text-center w-full hover:shadow-sm">
                  <Upload className="w-4 h-4 inline mr-2" />
                  <span className="truncate">{uploadLabelText}</span>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>

                {showUploadButton && (
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={loading.imageUpload}
                    loadingText="Uploading..."
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {uploadButtonText}
                  </Button>
                )}
              </form>
            ) : (
              <p className="text-sm text-gray-500">
                Image upload temporarily disabled
              </p>
            )}
          </div>

          {/* Profile Form */}
          <form
            onSubmit={handleProfileUpdate}
            className="space-y-4 sm:space-y-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  fieldErrors.name
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter your full name"
                disabled={isProcessing}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="uname"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                id="uname"
                type="text"
                name="uname"
                value={formData.uname}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  fieldErrors.uname
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter your username"
                disabled={isProcessing}
              />
              {fieldErrors.uname && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.uname}</p>
              )}
            </div>

            {statusMessage.text && (
              <Message type={statusMessage.type} message={statusMessage.text} />
            )}

            <div className="flex justify-center sm:justify-end pt-6">
              <Button
                type="submit"
                isLoading={loading.profileUpdate}
                loadingText="Updating..."
                disabled={!hasFormChanges || isProcessing}
                className="w-full sm:w-auto min-w-[120px]"
              >
                Update Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
