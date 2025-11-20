import { useRef } from "react";
import './ProfileImagePicker.css';

interface ProfileImagePickerProps {
  value: string | null;
  onChange: (val: string | null) => void;
}

const ProfileImagePicker = ({ value, onChange }: ProfileImagePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="main-container">
      <div className="image-wrapper">
        {value ? (
          <img src={value} alt="Profile preview" className="profile-img" />
        ) : (
          <div className="profile-img-placeholder">No Image</div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      <div className="button-row">
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
  >
    Select Image
  </button>

  <label htmlFor="camera-capture" style={{ width: "100%" }}>
    <button type="button" style={{ width: "100%" }}>
      Take Photo
    </button>
  </label>
</div>


      <input
        type="file"
        accept="image/*"
        capture="user"
        style={{ display: "none" }}
        id="camera-capture"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      {value && (
        <button type="button" onClick={() => onChange(null)}>
          Remove
        </button>
      )}
    </div>
  );
};

export default ProfileImagePicker;
