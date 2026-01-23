from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import DietType
from .serializers import DietTypeSerializer


class DietTypeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = DietType.objects.all()

        active = request.query_params.get("active")
        if active == "true":
            queryset = queryset.filter(is_active=True)

        serializer = DietTypeSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DietTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class DietTypeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(DietType, pk=pk)

    def get(self, request, pk):
        diet = self.get_object(pk)
        serializer = DietTypeSerializer(diet)

        return Response(serializer.data)

    def put(self, request, pk):
        diet = self.get_object(pk)
        serializer = DietTypeSerializer(diet, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        diet = self.get_object(pk)

        serializer = DietTypeSerializer(
            diet,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        diet = self.get_object(pk)
        diet.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
