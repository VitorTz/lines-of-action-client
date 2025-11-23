import { useFormContext } from "react-hook-form";
import type { SignupForm } from "../types/user";


const AddressForm = () => {
  const {
    register,
    formState: { errors }
  } = useFormContext<SignupForm>();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h3>Endereço</h3>

      <input
        placeholder="País"
        {...register("address.country", { required: true })}
      />
      {errors.address?.country && <div className="error-message">Campo obrigatório</div>}

      <input
        placeholder="Estado"
        {...register("address.state", { required: true })}
      />
      {errors.address?.state && <div className="error-message">Campo obrigatório</div>}

      <input
        placeholder="Cidade"
        {...register("address.city", { required: true })}
      />
      {errors.address?.city && <div className="error-message">Campo obrigatório</div>}
    </div>
  );
};

export default AddressForm;
