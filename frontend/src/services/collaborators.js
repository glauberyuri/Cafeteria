// src/services/collaborators.js
import api from '@/services/api';

/* =======================
   EMPLOYEES
   ======================= */
export async function getEmployees() {
  const res = await api.get('employees/');
  return res.data;
}

export async function createEmployee(data) {
  const res = await api.post('employees/', data);
  return res.data;
}

export async function updateEmployee(id, data) {
  const res = await api.put(`employees/${id}/`, data);
  return res.data;
}

/* =======================
   DOCTORS
   ======================= */
export async function getDoctors() {
  const res = await api.get('doctors/');
  return res.data;
}

export async function createDoctor(data) {
  const res = await api.post('doctors/', data);
  return res.data;
}

export async function updateDoctor(id, data) {
  const res = await api.put(`doctors/${id}/`, data);
  return res.data;
}

/* =======================
   ACADEMICS
   ======================= */
export async function getAcademics() {
  const res = await api.get('academics/');
  return res.data;
}

export async function createAcademic(data) {
  const res = await api.post('academics/', data);
  return res.data;
}

export async function updateAcademic(id, data) {
  const res = await api.put(`academics/${id}/`, data);
  return res.data;
}

export async function getCollaborators() {
  const [employees, doctors, academics] = await Promise.all([
    getEmployees(),
    getDoctors(),
    getAcademics(),
  ]);

  return [
    ...employees.map(e => ({ ...e, type: 'EMPLOYEE' })),
    ...doctors.map(d => ({ ...d, type: 'DOCTOR' })),
    ...academics.map(a => ({ ...a, type: 'ACADEMIC' })),
  ];
}

export async function saveMealPreference(registration, data) {
  return api.post('employee-meal-preference/', {
    employee_registration: registration,
    ...data,
  });
}