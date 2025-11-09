import { useQuery } from "@tanstack/react-query";
import { Session, SessionType, SessionStatus } from "../sessions";
import {
  mockSessionsForWeek,
  generateMockSessionsForWeek,
} from "../../../mocks/sessionsMockData";

// Mock implementation of useSessionsForWeek hook
export function useSessionsForWeek(weekStartDate: string) {
  return useQuery({
    queryKey: ["sessions", "week", weekStartDate],
    queryFn: () => {
      // Return mock data - you can switch between static and generated data
      return Promise.resolve(mockSessionsForWeek);
      // Or use generated data: return Promise.resolve(generateMockSessionsForWeek(weekStartDate));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Add some realistic loading behavior
    enabled: true,
  });
}

// Alternative mock with loading states for testing
export function useSessionsForWeekWithLoading(
  weekStartDate: string,
  isLoading: boolean = false
) {
  return useQuery({
    queryKey: ["sessions", "week", weekStartDate],
    queryFn: () => {
      return new Promise<Session[]>((resolve) => {
        setTimeout(
          () => {
            resolve(mockSessionsForWeek);
          },
          isLoading ? 1000 : 0
        ); // Simulate loading delay
      });
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });
}

// Mock with error state for testing error handling
export function useSessionsForWeekWithError(
  weekStartDate: string,
  hasError: boolean = false
) {
  return useQuery({
    queryKey: ["sessions", "week", weekStartDate],
    queryFn: () => {
      if (hasError) {
        throw new Error("Failed to fetch sessions");
      }
      return Promise.resolve(mockSessionsForWeek);
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
    retry: false, // Don't retry on error for testing
  });
}
