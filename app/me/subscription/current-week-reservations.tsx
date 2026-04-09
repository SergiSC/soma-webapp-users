import { useUser } from "@/context/user-context";
import { useUserCurrentWeekReservations } from "@/hooks/api/reservations";

export function CurrentWeekReservations() {
  const { user } = useUser();
  const { data: reservations } = useUserCurrentWeekReservations(
    user?.id,
    user?.subscriptionId ?? undefined,
  );
  return (
    <div>
      <h1>Current Week Reservations</h1>
      <ul>
        {reservations?.items.map((reservation) => (
          <li key={reservation.id}>{reservation.session.type}</li>
        ))}
      </ul>
    </div>
  );
}
