import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5005/v1/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setForm(res.data.user);
        setLoading(false);
      } catch {
        toast.error('❌ Failed to load profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.put('http://localhost:5005/v1/user/update-profile', form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success('✅ Profile updated successfully');

    // ✅ Save updated user back to localStorage
    localStorage.setItem('user', JSON.stringify(form));

    setUser(form);
    setEditing(false);
  } catch {
    toast.error('❌ Failed to update profile');
  }
};


  if (loading) return <p className="text-gray-400">Loading profile...</p>;

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 bg-[#1E293B] p-8 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Your Profile</h1>

      <div className="grid grid-cols-1 gap-4">
        {['name', 'email', 'phone', 'profession', 'organization'].map((field) => (
          <div key={field} className="flex flex-col">
            <label className="font-semibold capitalize">{field}</label>
            {editing ? (
              <input
                type="text"
                name={field}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="bg-gray-800 p-2 rounded text-white mt-1"
              />
            ) : (
              <span className="text-gray-300 mt-1">{user[field]}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        {!editing ? (
          <button onClick={() => setEditing(true)} className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700">
            Update Profile
          </button>
        ) : (
          <>
            <button onClick={handleUpdate} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
