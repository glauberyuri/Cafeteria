from rest_framework.views import APIView
from rest_framework.generics import DestroyAPIView
from django.utils import timezone
from rest_framework.permissions import AllowAny
from datetime import timedelta, date
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404

from collaborators.models import Employee, Doctor, Academic, EmployeeMealPreference, AcademicAuthorization
from collaborators.serializers import (
    EmployeeSerializer,
    DoctorSerializer,
    AcademicSerializer,
    EmployeeMealPreferenceSerializer,
    AcademicAuthorizationSerializer
)


class EmployeeListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        queryset = Employee.objects.select_related("department")
        serializer = EmployeeSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EmployeeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Employee, pk=pk)

    def get(self, request, pk):
        employee = self.get_object(pk)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

    def put(self, request, pk):
        employee = self.get_object(pk)
        serializer = EmployeeSerializer(employee, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        employee = self.get_object(pk)
        serializer = EmployeeSerializer(
            employee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        employee = self.get_object(pk)
        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DoctorListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Doctor.objects.all()
        serializer = DoctorSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Doctor, pk=pk)

    def get(self, request, pk):
        doctor = self.get_object(pk)
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

    def put(self, request, pk):
        doctor = self.get_object(pk)
        serializer = DoctorSerializer(doctor, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        doctor = self.get_object(pk)
        serializer = DoctorSerializer(doctor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        doctor = self.get_object(pk)
        doctor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AcademicListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Academic.objects.all()
        serializer = AcademicSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):

        identifier = request.data.get("identifier")

        if not identifier:
            return Response(
                {"identifier": "Matrícula é obrigatória"},
                status=status.HTTP_400_BAD_REQUEST
            )

        academic, created = Academic.objects.get_or_create(
            identifier=identifier,
            defaults={
                "full_name": request.data.get("full_name"),
                "institution": request.data.get("institution"),
                "category": request.data.get("category"),
            }
        )

        serializer = AcademicSerializer(academic)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class AcademicDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Academic, pk=pk)

    def get(self, request, pk):
        academic = self.get_object(pk)
        serializer = AcademicSerializer(academic)
        return Response(serializer.data)

    def put(self, request, pk):
        academic = self.get_object(pk)
        serializer = AcademicSerializer(academic, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        academic = self.get_object(pk)
        serializer = AcademicSerializer(
            academic, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        academic = self.get_object(pk)
        academic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AcademicAuthorizationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        queryset = AcademicAuthorization.objects.select_related(
            "academic", "sector"
        ).order_by("-created_at")

        serializer = AcademicAuthorizationSerializer(queryset, many=True)

        return Response(serializer.data)

    def post(self, request):

        serializer = AcademicAuthorizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        academic = serializer.validated_data["academic"]
        today = now().date()

        already_valid = AcademicAuthorization.objects.filter(
            academic=academic,
            approved=True,
            end_date__gte=today
        ).exists()

        if already_valid:
            return Response(
                {"detail": "Este aluno já possui autorização ativa."},
                status=status.HTTP_400_BAD_REQUEST
            )

        pending = AcademicAuthorization.objects.filter(
            academic=academic,
            approved=False
        ).exists()

        if pending:
            return Response(
                {"detail": "Já existe uma solicitação pendente para este aluno."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AcademicAuthorizationApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        authorization = get_object_or_404(AcademicAuthorization, pk=pk)

        if authorization.approved:
            return Response(
                {"detail": "Autorização já aprovada"},
                status=status.HTTP_400_BAD_REQUEST
            )

        academic = authorization.academic
        today = now().date()

        if academic.category == "RESIDENT":
            duration = timedelta(days=180)
        else:
            duration = timedelta(days=7)

        authorization.approved = True
        authorization.start_date = today
        authorization.end_date = today + duration
        authorization.approved_at = now()
        authorization.approved_by = request.user
        authorization.save()

        return Response(
            {
                "detail": "Autorização aprovada",
                "expires_at": authorization.end_date
            },
            status=status.HTTP_200_OK
        )


class AcademicAuthorizationRejectView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = AcademicAuthorization.objects.all()

    def delete(self, request, pk):
        authorization = self.get_object()
        authorization.delete()
        return Response(
            {"detail": "Solicitação rejeitada e removida"},
            status=status.HTTP_204_NO_CONTENT
        )


class AcademicAuthorizationApproveAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):

        today = timezone.now().date()

        pending = AcademicAuthorization.objects.select_related("academic").filter(
            approved=False
        )

        approved_count = 0

        for auth in pending:

            academic = auth.academic

            already_valid = AcademicAuthorization.objects.filter(
                academic=academic,
                approved=True,
                end_date__gte=today
            ).exists()

            if already_valid:
                continue

            if academic.category == "RESIDENT":
                duration = timedelta(days=180)
            else:
                duration = timedelta(days=7)

            auth.approved = True
            auth.start_date = today
            auth.end_date = today + duration
            auth.approved_at = timezone.now()
            auth.approved_by = request.user
            auth.save()

            approved_count += 1

        return Response(
            {
                "detail": f"{approved_count} solicitações aprovadas",
                "approved": approved_count,
            },
            status=status.HTTP_200_OK
        )


class EmployeeMealPreferenceView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, registration):
        pref = EmployeeMealPreference.objects.filter(
            employee_registration=registration
        ).first()

        if not pref:
            return Response({"exists": False})

        return Response(EmployeeMealPreferenceSerializer(pref).data)

    def post(self, request):

        registration = request.data.get("employee_registration")
        mode = request.data.get("mode")

        if not registration or not mode:
            return Response(
                {"detail": "employee_registration e mode são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = Employee.objects.only("shift").filter(
            registration=registration,
            active=True
        ).first()

        if not employee:
            return Response(
                {"detail": "Funcionário não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        automation_type = None
        default_meal_type = None
        start_date = None

        if mode == "manual":

            active = True

        elif mode == "automatic":

            automation_type = "WEEKDAYS"
            active = True

            if employee.shift == Employee.SHIFT_DAY:
                default_meal_type = "LUNCH"
            else:
                default_meal_type = "DINNER"

        elif mode == "alternate":

            automation_type = "ALTERNATE"
            start_date = date.today()
            active = True

            if employee.shift == Employee.SHIFT_DAY:
                default_meal_type = "LUNCH"
            else:
                default_meal_type = "DINNER"

        else:
            return Response(
                {"detail": "mode inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        obj, _ = EmployeeMealPreference.objects.update_or_create(
            employee_registration=registration,
            defaults={
                "automation_type": automation_type,
                "default_meal_type": default_meal_type,
                "start_date": start_date,
                "active": active
            }
        )

        serializer = EmployeeMealPreferenceSerializer(obj)
        return Response(serializer.data)

    def put(self, request, registration):
        pref, _ = EmployeeMealPreference.objects.get_or_create(
            employee_registration=registration
        )
        serializer = EmployeeMealPreferenceSerializer(pref, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CollaboratorSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        identifier = request.query_params.get("identifier")
        collaborator_type = request.query_params.get("type")

        if not identifier or not collaborator_type:
            return Response(
                {"detail": "identifier e type são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST
            )

        identifier = identifier.strip()

        if collaborator_type == "employee":
            employee = Employee.objects.filter(
                registration=identifier,
                active=True
            ).select_related("department").first()

            if employee:
                data = EmployeeSerializer(employee).data

                has_preference = EmployeeMealPreference.objects.filter(
                    employee_registration=employee.registration,
                    active=True
                ).exists()

                return Response({
                    "type": "employee",
                    "full_name": data["full_name"],
                    "identifier": data["registration"],
                    "sector": data["department_name"],
                    "has_preference": has_preference
                })

        elif collaborator_type == "doctor":
            doctor = Doctor.objects.filter(
                crm=identifier,
                active=True
            ).first()

            if doctor:
                data = DoctorSerializer(doctor).data
                return Response({
                    "type": "doctor",
                    "full_name": data["full_name"],
                    "identifier": data["crm"],
                    "sector": "Médico"
                })

        elif collaborator_type == "student":
            academic = Academic.objects.filter(
                identifier=identifier,
                active=True
            ).first()

            if academic:
                data = AcademicSerializer(academic).data
                return Response({
                    "type": "student",
                    "full_name": data["full_name"],
                    "identifier": data["identifier"],
                    "faculty": data["institution"]
                })

        else:
            return Response(
                {"detail": "type inválido. Use: employee, doctor ou student"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"detail": "Colaborador não encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
