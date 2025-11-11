import { api, User } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseLoggedUserProps {
  onSuccess?: (data: User) => void;
  onError?: (error: Error) => void;
}

export function useLoggedUser({ onSuccess, onError }: UseLoggedUserProps = {}) {
  return useMutation({
    mutationKey: ["logged-user"],
    mutationFn: api.users.login,
    onSuccess,
    onError:
      onError ||
      (() => {
        toast.error(`Error al obtenir l'usuari`);
      }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-user"],
    mutationFn: api.users.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logged-user"] });
    },
    onError: () => {
      toast.error("No s'ha pogut actualitzar l'usuari");
    },
  });
}
