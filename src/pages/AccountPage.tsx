import { Camera, User, Mail, Calendar, Check, X, Loader, LogOut, MapPin, Hash } from "lucide-react";
import { useAuth } from "../components/auth/AuthContext";
import { useState } from "react";
import './AccountPage.css'
import { formatDate } from "../util/util";
import { linesApi } from "../api/linesApi";
import { useNotification } from "../components/notification/NotificationContext";
import type { PageType } from "../types/general";


interface AccountPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const AccountPage = ({ navigate }: AccountPageProps) => {
  const { user, logout, setUser } = useAuth();
  const { addNotification } = useNotification()
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    age: user?.age ?? 0,
    address: {
      country: user?.address.country ?? "",
      city: user?.address?.city ?? "",
      state: user?.address?.state ?? ""
    }
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSuccess = () => {
    addNotification({
        title: "Dados alterados!",
        type: "success"
      }
    )
  }


  const handleError = (error: any) => {
    let message = "Verifique se os dados foram preenchidos corretamente"
    try {
      const m = error.response.data.error  
      message = m
    } catch (err) { }

    addNotification({
      title: "Erro",
      message: message,
      type: "error"
    })
  }


  const handleUpdateProfile = async () => {
    setLoading(true);    
    await linesApi
      .user
      .updateProfile(editForm)
      .then((user) => {handleSuccess(); setUser(user)})
      .catch(err => handleError(err))

    setIsEditing(false)
    setLoading(false)
  };

  const handleImageUpload = async (e: any) => {
    if (!user) return;    
    
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setUploadingImage(true);
      const result = await linesApi
        .images
        .upload(file)
        .then(result => { return result })
        .catch(err => console.log(err))

      if (result) {
        const imgSrc = linesApi.images.getImageSrc(result.filename);
        await linesApi
          .user
          .updateProfileImageUrl(imgSrc)
          .then(user => setUser(user))
        console.log(imgSrc)
      }
    setUploadingImage(false);
  };
  

  const handleCancelEdit = () => {
    setEditForm({
      username: user!.username,
      email: user!.email,
      age: user!.age,
      address: user!.address
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    logout();
    navigate('lobby');
  };

  if (!user) { return <></>; }

  return (
    <div className="account-container">
      <div className="account-card">
        {/* Header com imagem de perfil */}
        <div className="account-header">
          <div className="profile-image-container">
            {
              user.perfilImageUrl ?
              <img src={user.perfilImageUrl} alt="" className="profile-image"  /> 
              :
              <span className="profile-initial">
                {user.username.charAt(0).toUpperCase()}
              </span>
            }
            
            <label htmlFor="profile-image" className="camera-button">
              {uploadingImage ? (
                <Loader size={20} className="spinner" />
              ) : (
                <Camera size={20} />
              )}
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          
          <h1 className="profile-username">{user.username}</h1>
        </div>

        {/* Formulário */}
        <div className="account-body">
          <div className="form-grid">
            {/* Username */}
            <div className="form-field">
              <label className="form-label">
                <User size={18} />
                Username
              </label>
              <input
                type="text"
                className={`form-input ${!isEditing ? 'disabled' : ''}`}
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                disabled={!isEditing || loading}
                placeholder="username"
              />
            </div>

            {/* Email */}
            <div className="form-field">
              <label className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                className={'form-input disabled'}
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                disabled={true}
                placeholder="bob@email.com"
              />
            </div>

            {/* Age */}
            <div className="form-field">
              <label className="form-label">
                <Hash size={18} />
                Idade
              </label>
              <input
                type="number"
                className={`form-input ${!isEditing ? 'disabled' : ''}`}
                value={editForm.age}
                onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                disabled={!isEditing || loading}
                placeholder="25"
              />
            </div>

            {/* Address Section */}
            <div className="address-section">
              <h3 className="address-title">
                <MapPin size={20} />
                Endereço
              </h3>
              
              <div className="address-grid">
                <div className="address-field full-width">
                  <label className="address-label">País</label>
                  <input
                    type="text"
                    className={`address-input ${!isEditing ? 'disabled' : ''}`}
                    value={editForm.address.country}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      address: { ...editForm.address, country: e.target.value }
                    })}
                    disabled={!isEditing || loading}
                  />
                </div>                

                <div className="address-field">
                  <label className="address-label">Cidade</label>
                  <input
                    type="text"
                    className={`address-input ${!isEditing ? 'disabled' : ''}`}
                    value={editForm.address.city}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      address: { ...editForm.address, city: e.target.value }
                    })}
                    disabled={!isEditing || loading}
                  />
                </div>

                <div className="address-field">
                  <label className="address-label">Estado</label>
                  <input
                    type="text"
                    className={`address-input ${!isEditing ? 'disabled' : ''}`}
                    value={editForm.address.state}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      address: { ...editForm.address, state: e.target.value }
                    })}
                    disabled={!isEditing || loading}
                  />
                </div>

              </div>
            </div>

            {/* Created at */}
            <div className="form-field">
              <label className="form-label">
                <Calendar size={18} />
                Criado em
              </label>
              <div className="created-date">
                {formatDate(user.createdAt)}
              </div>
            </div>
          </div>

          {/* Alertas */}
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
              <X size={20} onClick={() => setError("")} style={{ cursor: 'pointer' }} />
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>{success}</span>
              <X size={20} onClick={() => setSuccess("")} style={{ cursor: 'pointer' }} />
            </div>
          )}

          {/* Botões de ação */}
          <div className="action-buttons">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                  Editar perfil
                </button>
                <button onClick={handleLogout} className="btn btn-danger">
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={handleUpdateProfile} disabled={loading} className="btn btn-success">
                  {loading ? (
                    <>
                      <Loader size={18} className="spinner" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Salvar mudanças
                    </>
                  )}
                </button>
                <button onClick={handleCancelEdit} disabled={loading} className="btn btn-secondary">
                  <X size={18} />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AccountPage;