import api from "@/services/api";


export async function searchCollaborator(identifier, type) {
  const res = await api.get("/collaborators/search/", {
    params: {
      identifier,
      type,
    },
  });

  return res.data;
}


export async function getEmployees(params = {}) {
  const res = await api.get("/employees/", { params });
  return res.data;
}

export async function createEmployee(data) {
  const res = await api.post("/employees/", data);
  return res.data;
}

export async function updateEmployee(id, data) {
  const res = await api.put(`/employees/${id}/`, data);
  return res.data;
}

export async function deleteEmployee(id) {
  await api.delete(`/employees/${id}/`);
}



export async function getDoctors() {
  const res = await api.get("/doctors/");
  return res.data;
}

export async function createDoctor(data) {
  const res = await api.post("/doctors/", data);
  return res.data;
}

export async function updateDoctor(id, data) {
  const res = await api.put(`/doctors/${id}/`, data);
  return res.data;
}

export async function deleteDoctor(id) {
  await api.delete(`/doctors/${id}/`);
}


export async function getAcademics() {
  const res = await api.get("/academics/");
  return res.data;
}

export async function createAcademic(data) {
  const res = await api.post("/academics/", data);
  return res.data;
}

export async function updateAcademic(id, data) {
  const res = await api.put(`/academics/${id}/`, data);
  return res.data;
}

export async function deleteAcademic(id) {
  await api.delete(`/academics/${id}/`);
}


export async function saveMealPreference(registration, data) {
  const res = await api.post("/employee-meal-preference/", {
    employee_registration: registration,
    ...data,
  });

  return res.data;
}