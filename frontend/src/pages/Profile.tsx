import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/users";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setUsername(profile.name || "");
        setAvatarUrl(profile.avatar || null);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    // For now, convert to base64 - you can implement file upload to your backend later
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        await userService.updateProfile({ avatar: base64 });
        setAvatarUrl(base64);
        toast.success("Avatar updated!");
      } catch (error) {
        toast.error("Failed to upload avatar");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updatedUser = await userService.updateProfile({ name: username });
      setUser(updatedUser);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      <div className="mx-auto max-w-md lg:max-w-4xl px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/settings")}>
            <Icon icon="mdi:arrow-left" className="text-2xl text-foreground" />
          </motion.button>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="relative"
          >
            <div className="h-24 w-24 rounded-full bg-muted border-2 border-gray-300 dark:border-gray-300 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <Icon icon="mdi:account" className="text-4xl text-muted-foreground" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              {uploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Icon icon="mdi:camera" className="text-sm text-primary-foreground" />
              )}
            </div>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-muted px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your username"
            />
          </div>

          <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-xl bg-muted px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your phone number"
            />
          </div>

          <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
            <p className="text-foreground px-4 py-3">{user?.email || "Not set"}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </div>
      <BottomNav />
    </motion.div>
  );
};

export default Profile;
