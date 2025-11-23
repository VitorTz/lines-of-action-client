import { useForm, FormProvider, Controller } from "react-hook-form";
import type { SignupForm } from "../types/user";
import type { PageType } from "../types/general";
import { useAuth } from "../components/auth/AuthContext";
import ProfileImagePicker from "../components/ProfileImagePicker";
import AddressForm from "../components/AddressForm";
import "./AuthPage.css";
import { useNotification } from "../components/notification/NotificationContext";
import { linesApi } from "../api/linesApi";

interface SignupPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const SignupPage = ({ navigate }: SignupPageProps) => {
  
  const { addNotification } = useNotification();
  const { setUser, signup } = useAuth();

  const handleSuccess = (username: string) => {
    addNotification({
      type: "success",
      title: "Conta criada!",
      message: `Bem vindo(a), ${username}`,
      duration: 3000,
    });
  };

  const handleError = (erro: string) => {
    addNotification({
      type: "error",
      title: "Erro ao criar conta",
      message: erro,
      duration: 3000,
    });
  };

  const showImageUploadNotification = () => {
    addNotification({
      title: "Aguarde...",
      message: "Fazendo upload da sua foto de perfil",
      type: "success",
      duration: 3000,
    });
  }

  const methods = useForm<SignupForm>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      age: 0,
      perfilImageFile: null,
      address: {
        country: "",
        state: "",
        city: "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (signupForm: SignupForm) => {
    const { ok, error } = await signup(signupForm);

    if (error) {
      try {
        const message: string = error.response.data.error
        handleError(message)
      } catch (err) {
        handleError('Não foi possível criar sua conta, verifique as informações.')
      }
      return
    }

    if (signupForm.perfilImageFile) {
      showImageUploadNotification()
      const result = await linesApi
        .images
        .upload(signupForm.perfilImageFile)
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
    }
    
    handleSuccess(signupForm.username);
    navigate("login");

  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Cadastro</h1>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              placeholder="username"
              {...register("username", { required: true })}
            />
            {errors.username && <div className="error-message">Campo obrigatório</div>}

            <input
              placeholder="email"
              type="email"
              {...register("email", { required: true })}
            />
            {errors.email && <div className="error-message">Campo obrigatório</div>}

            <input
              placeholder="senha"
              type="password"
              {...register("password", { required: true })}
            />
            {errors.password && <div className="error-message">Campo obrigatório</div>}

            <input
              placeholder="idade"
              type="number"
              {...register("age", { required: true, valueAsNumber: true })}
            />
            {errors.age && <div className="error-message">Campo obrigatório</div>}

            <AddressForm />

            <h3>Avatar</h3>
            <Controller
              control={control}
              name="perfilImageFile"
              render={({ field }) => (
                <ProfileImagePicker
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <button type="submit">Cadastrar</button>
          </form>
        </FormProvider>

        <p>
          Já tem uma conta?{" "}
          <a onClick={() => navigate("login")}>Entrar</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
