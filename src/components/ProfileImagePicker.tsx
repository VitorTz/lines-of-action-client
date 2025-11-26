import { useRef, useEffect, useState } from "react";
import "./ProfileImagePicker.css";

interface ProfileImagePickerProps {
  value: File | null | undefined;
  onChange: (val: File | null) => void;
}

const ProfileImagePicker = ({ value, onChange }: ProfileImagePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFile = (file: File) => {
    onChange(file);
  };

  return (
    <div className="main-container">
      <div className="image-wrapper">
        {previewUrl ? (
          <img src={previewUrl} alt="Profile preview" className="profile-img" />
        ) : (
          <div className="profile-img-placeholder">Sem imagem</div>
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
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Selecionar
        </button>

        <label htmlFor="camera-capture" style={{ width: "100%" }}>
          <button type="button" style={{ width: "100%" }}>
            Tirar foto
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
          Remover
        </button>
      )}
    </div>
  );
};

export default ProfileImagePicker;
