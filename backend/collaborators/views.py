from rest_framework.views import APIView
from rest_framework.generics import DestroyAPIView
from django.utils import timezone
from datetime import timedelta
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
        return Response(serializer.erros, status=status.HTTP_400_BAD_REQUEST)

    def path(self, request, pk):
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
        serializer = AcademicSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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


class EmployeeMealPreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, registration):
        pref = EmployeeMealPreference.objects.filter(
            employee_registration=registration
        ).first()

        if not pref:
            return Response(None)

        return Response(EmployeeMealPreferenceSerializer(pref).data)

    def post(self, request):
        obj, _ = EmployeeMealPreference.objects.update_or_create(
            employee_registration=request.data['employee_registration'],
            defaults=request.data
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
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class AcademicAuthorizationApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:
            authorization = AcademicAuthorization.objects.get(pk=pk)
        except AcademicAuthorization.DoesNotExist:
            return Response(
                {"detail": "Autorização não encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
        if authorization.approved:
            return Response(
                {"detail": "Autorização já aprovada"},
                status=status.HTTP_400_BAD_REQUEST
            )
        today = now().date()
        authorization.approved = True
        authorization.start_date = today
        authorization.end_date = today + timedelta(days=7)
        authorization.approved_at = now()
        authorization.save()


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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = timezone.now().date()
        end_date = today + timedelta(days=7)

        pending = AcademicAuthorization.objects.filter(end_date__isnull=True)

        count = pending.count()

        for auth in pending:
            auth.end_date = end_date
            auth.save()

        return Response(
            {
                "detail": f"{count} solicitações aprovadas",
                "approved": count,
            },
            status=status.HTTP_200_OK
        )
