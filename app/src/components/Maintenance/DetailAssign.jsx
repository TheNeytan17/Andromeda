// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Settings,
  Target,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";

// Servicio
import AssignmentService from "../../services/AssignmentService";
import TicketService from "../../services/TicketService";

// ========================================
// MAPEOS / CONSTANTES DE UI
// ========================================

// ========================================
// COMPONENTE: Detalle de Asignación
// ========================================
export function DetailAssignment() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [assignResp, setAssignResp] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mapeos dinámicos con traducciones
  const METODO_ASIGNACION = {
    1: t("details.assignment.assignmentMethod.manual"),
    2: t("details.assignment.assignmentMethod.automatic"),
  };

  const PRIORIDAD_DESC = {
    1: t("details.ticket.priority.veryLow"),
    2: t("details.ticket.priority.low"),
    3: t("details.ticket.priority.medium"),
    4: t("details.ticket.priority.high"),
    5: t("details.ticket.priority.critical"),
  };

  // Cargar detalle de la asignación al montar o cambiar id
  useEffect(() => {
    const fetchData = async () => {
      try {
        // El id viene como Id_Ticket, buscar la asignación correspondiente
        const allAssignments = await AssignmentService.getAssignments();
        const assignments =
          allAssignments?.data?.data || allAssignments?.data || [];

        // Buscar la asignación más reciente para este ticket
        const ticketAssignments = assignments.filter(
          (a) =>
            String(a.Id_Ticket) === String(id) ||
            String(a.id_ticket) === String(id)
        );

        if (ticketAssignments.length === 0) {
          setError("No se encontró la asignación para este ticket");
          setLoading(false);
          return;
        }

        // Ordenar por fecha y tomar la más reciente
        const latestAssignment = ticketAssignments.sort(
          (a, b) =>
            new Date(b.Fecha_Asignacion || b.fecha_asignacion) -
            new Date(a.Fecha_Asignacion || a.fecha_asignacion)
        )[0];

        // Obtener información adicional del ticket
        try {
          const ticketResponse = await TicketService.getTicketById(id);
          const ticketData = ticketResponse?.data?.data || ticketResponse?.data;

          // Enriquecer la asignación con datos del ticket
          const enrichedAssignment = {
            ...latestAssignment,
            Categoria:
              ticketData?.Categoria ||
              ticketData?.categoria ||
              latestAssignment.Categoria,
            Estado:
              ticketData?.Estado ||
              ticketData?.estado ||
              latestAssignment.Estado,
            TiempoLimite:
              ticketData?.Fecha_Limite_Resolucion ||
              ticketData?.fecha_limite_resolucion ||
              latestAssignment.TiempoLimite,
          };

          setAssignResp({ success: true, data: enrichedAssignment });
        } catch (ticketErr) {
          console.warn("No se pudo cargar información del ticket:", ticketErr);
          // Si falla, usar solo datos de la asignación
          setAssignResp({ success: true, data: latestAssignment });
        }
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingGrid count={1} type="grid" />;
  if (error)
    return (
      <ErrorAlert title={t("details.assignment.loadError")} message={error} />
    );
  if (!assignResp || !assignResp.data)
    return <EmptyState message={t("details.assignment.noData")} />;

  // Normalizar respuesta: si viene arreglo, tomar primer elemento
  const asignacion = Array.isArray(assignResp.data)
    ? assignResp.data[0]
    : assignResp.data;

  const tecnicoId = id;
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 md:px-10 lg:px-16">
      <div className="space-y-6">
        {/* Encabezado principal */}
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t("details.assignment.title")} #{asignacion.Id} —{" "}
            {t("details.assignment.technician")} #{tecnicoId}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {t("details.assignment.detailBadge")}
          </Badge>
        </div>

        {/* Tarjeta con información de asignación y ticket */}
        <div className="space-y-4">
          <Card
            className="border-2 border-[#fc52af] backdrop-blur-lg"
            style={{
              backgroundColor: "rgba(252, 82, 175, 0.05)",
              boxShadow: "0 8px 32px 0 rgba(252, 82, 175, 0.15)",
            }}
          >
            <CardContent className="p-6 space-y-6">
              {/* Encabezado de ticket + acciones */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {t("details.assignment.ticket")} #
                  {asignacion.Id_Ticket ?? "N/D"}
                </div>
                <div className="flex items-center gap-2">
                  {asignacion.Id_Ticket && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/Ticket/${asignacion.Id_Ticket}`)
                      }
                    >
                      {t("details.assignment.viewTicket")}
                    </Button>
                  )}
                </div>
              </div>
              {/* Información principal */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Fecha de asignación */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar
                      className="h-5 w-5"
                      style={{ color: "#fbb25f" }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: "#f7f4f3" }}
                    >
                      {t("details.assignment.assignmentDate")}:
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {asignacion.Fecha_Asignacion || "N/D"}
                  </p>
                </div>

                {/* Método de asignación */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Settings
                      className="h-5 w-5"
                      style={{ color: "#fbb25f" }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: "#f7f4f3" }}
                    >
                      {t("details.assignment.assignmentMethodLabel")}:
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {METODO_ASIGNACION[asignacion.Metodo_Asignacion] ||
                      asignacion.Metodo_Asignacion ||
                      "N/D"}
                  </p>
                </div>

                {/* Prioridad */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5" style={{ color: "#fbb25f" }} />
                    <span
                      className="font-semibold"
                      style={{ color: "#f7f4f3" }}
                    >
                      {t("details.ticket.priority.label")}:
                    </span>
                    <Badge
                      variant={
                        asignacion.Prioridad >= 4 ? "destructive" : "secondary"
                      }
                    >
                      {asignacion.Prioridad}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {PRIORIDAD_DESC[asignacion.Prioridad] || "N/D"}
                  </p>
                </div>

                {/* Regla de autotriage */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <ChevronRight
                      className="h-5 w-5"
                      style={{ color: "#fbb25f" }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: "#f7f4f3" }}
                    >
                      {t("details.assignment.autoTriageRule")}:
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {asignacion.Id_ReglaAutobriage
                      ? `#${asignacion.Id_ReglaAutobriage}`
                      : t("details.assignment.noRuleApplied")}
                  </p>
                </div>
              </div>

              {/* Información del ticket */}
              <div className="pt-4" style={{ borderTop: "1px solid #fc52af" }}>
                <div className="space-y-2">
                  <span
                    className="font-semibold text-lg"
                    style={{ color: "#f7f4f3" }}
                  >
                    {t("details.assignment.ticketInfo")}
                  </span>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {/* Columna 1 */}
                      <div className="flex items-center gap-2">
                        {/* Icono de categoría */}
                        <span className="p-2 rounded-full bg-purple-500/20 border border-purple-400/50">
                          {/* Ejemplo: icono de carpeta */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-purple-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 7a2 2 0 012-2h3.5a2 2 0 011.6.8l1.2 1.6H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                            />
                          </svg>
                        </span>
                        <span className="font-semibold">Categoría:</span>{" "}
                        <span>{asignacion.Categoria || "N/D"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Icono de estado */}
                        <span className="p-2 rounded-full bg-blue-500/20 border border-blue-400/50">
                          {/* Ejemplo: icono de etiqueta */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 7h.01M3 7a2 2 0 012-2h3.5a2 2 0 011.6.8l7.2 9.6a2 2 0 01-1.6 3.2H5a2 2 0 01-2-2V7z"
                            />
                          </svg>
                        </span>
                        <span className="font-semibold">Estado:</span>{" "}
                        <span className="inline-block px-2 py-1 rounded border border-zinc-400/30 bg-zinc-800/40 text-xs ml-2">
                          {asignacion.Estado || "N/D"}
                        </span>
                      </div>
                      {/* Columna 2 */}
                      <div className="flex items-center gap-2">
                        {/* Icono de reloj para tiempo límite */}
                        <span className="p-2 rounded-full bg-pink-500/20 border border-pink-400/50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-pink-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6l4 2"
                            />
                          </svg>
                        </span>
                        <span className="font-semibold">Tiempo Límite:</span>{" "}
                        <span>{asignacion.TiempoLimite || "N/D"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Icono de usuario para técnico asignado */}
                        <span className="p-2 rounded-full bg-green-500/20 border border-green-400/50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5.121 17.804A9.969 9.969 0 0112 15c2.21 0 4.253.72 5.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </span>
                        <span className="font-semibold">Técnico Asignado:</span>{" "}
                        <span>
                          {asignacion.Tecnico ||
                            asignacion.NombreTecnico ||
                            `ID: ${asignacion.Id_Tecnico}` ||
                            "N/D"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botón para volver a la vista anterior */}
      <Button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("common.back")}
      </Button>
    </div>
  );
}
