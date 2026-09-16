import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function usePastPaperSolverAccess(providedUser) {
  const { data: queriedUser, isLoading: loadingUser } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => base44.auth.me(),
    enabled: !providedUser,
    retry: false,
  });
  const user = providedUser || queriedUser;
  const hasDirectAccess = user?.role === "admin" || user?.role === "instructor" || user?.is_tutor === true;
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["solver-access-enrollments", user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user.email }, "-created_date", 1),
    enabled: !!user?.email && !hasDirectAccess,
  });

  return {
    canAccess: !!hasDirectAccess || enrollments.length > 0,
    isLoading: (!providedUser && loadingUser) || (!!user?.email && !hasDirectAccess && loadingEnrollments),
  };
}