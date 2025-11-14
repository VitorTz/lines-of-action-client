import { useState } from "react";
import { Camera, User, Mail, Calendar, Check, X, Loader, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { linesApi } from "../api/linesApi";
import type { PageType } from "../types/general";
import "./AccountPage.css";


interface AccountPageProps {
  navigate: (page: PageType, data?: any) => void
}


const AccountPage = ({ navigate }: AccountPageProps) => {
  const { user, setUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    await linesApi.user
      .updateProfile(editForm)
      .then((user) => setUser(user))
      .catch((err) => {
        setError(err.response.data.detail ?? "invalid data");
        setEditForm({ username: user!.username, email: user!.email });
      });
    setLoading(false);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: any) => {
    if (!user) {
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image fileo");
      return;
    }

    setUploadingImage(true);
    setError("");
    setSuccess("");

    await linesApi
        .user
        .updateProfileImage(file)
        .then((r) => setUser({ ...user, perfil_image_url: r.url }))
        .catch((err) => setError(err.message));

    setUploadingImage(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: user!.username,
      email: user!.email,
    });
    setIsEditing(false);
    setError("");
  };

  const handleLogout = async () => {
    logout()
    navigate('home')
  }

  if (!user) {
    return <></>;
  }

  return (
    <div className="container" >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>      
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: "var(--border-radius)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
          }}
        >
          {/* Seção de Imagem de Perfil */}
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--secondary))",
              padding: "3rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  background: user.perfil_image_url
                    ? `url(${user.perfil_image_url}) center/cover`
                    : "var(--light)",
                  border: "4px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {!user.perfil_image_url && (
                  <User size={60} color="var(--text-light)" />
                )}
              </div>

              <label
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: uploadingImage ? "not-allowed" : "pointer",
                  boxShadow: "var(--shadow-md)",
                  border: "3px solid white",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  !uploadingImage &&
                  (e.currentTarget.style.transform = "scale(1.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {uploadingImage ? (
                  <Loader
                    size={20}
                    color="white"
                    style={{
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Camera size={20} color="white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            <h2
              style={{
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "600",
                margin: 0,
              }}
            >
              {user.username}
            </h2>
          </div>

          {/* Formulário de Informações */}
          <div style={{ padding: "2rem" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Username */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text)",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <User size={18} color="var(--primary)" />
                  Username
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  placeholder="username"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text)",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <Mail size={18} color="var(--primary)" />
                  Email
                </label>
                <input
                  type="email"
                  className="profile-input"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  placeholder="bob@email.com"
                />
              </div>

              <div
                style={{
                  background: "var(--bg)",
                  padding: "1.5rem",
                  borderRadius: "var(--border-radius)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--text-light)",
                        fontSize: "0.85rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <Calendar size={16} />
                      Created at
                    </div>
                    <div
                      style={{
                        color: "var(--text)",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                      }}
                    >
                      {formatDate(user.createdAt)}
                    </div>
                  </div>

                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{error}</span>
                    <X
                      size={20}
                      color="red"
                      onClick={() => setError("")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{success}</span>
                    <X
                      size={20}
                      color="red"
                      onClick={() => setSuccess("")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "1rem",
                  flexWrap: "wrap",
                }}
              >
                {!isEditing ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={handleUpdateProfile}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader
                            size={18}
                            style={{
                              animation: "spin 1s linear infinite",
                            }}
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={18} />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
