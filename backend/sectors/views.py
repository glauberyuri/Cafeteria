from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Sector
from .serializers import SectorSerializer


class SectorListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Sector.objects.all()
        active = request.query_params.get("active")

        if active == "True":
            queryset = queryset.filter(is_active=True)

        serializer = SectorSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SectorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class SectorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Sector, pk=pk)

    def get(self, request, pk):
        sector = self.get_object(pk)
        serializer = SectorSerializer(sector)
        return Response(serializer.data)

    def put(self, request, pk):
        sector = self.get_object(pk)
        serializer = SectorSerializer(sector, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        sector = self.get_object(pk)
        serializer = SectorSerializer(
            sector,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        sector = self.get_object(pk)
        sector.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
