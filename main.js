// Declaración de variables
const BASE_URL_LOGIN = "https://reqres.in";
const BASE_URL = "https://api.tdt-resources-v2.dev.tolber.io/api";
const POST_LOGIN = "/api/login";
const GET_ORGANIZATION = "/organizations-public?sort[0]=-createdAt";
const POST_ORGANIZATION = "/organizations-public";
const DEL_PUT_ORGANIZATION = "/organizations-public/:id";
const login = document.getElementById("login");
const email = document.getElementById("email");
const password = document.getElementById("password");
const nameCreate = document.getElementById("name");
const aliasNameCreate = document.getElementById("alias_name");
const submit = document.getElementById("submit");
const createOrganization = document.getElementById("create-organization");
const containerOrganization = document.getElementById("organization");
const error = document.getElementById("error");
const exitButton = document.getElementById("exit");
const notification = document.getElementById("notification");
const spinner = document.getElementById("spinner");

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
  if (localStorageFunction.get("token")) {
    showList();
  }
  showLogin();
});

// Eventos
submit.addEventListener("click", submitLogin);
createOrganization.addEventListener("click", handleCreate);
exitButton.addEventListener("click", logout);
containerOrganization.addEventListener("click", handleOrg);
// LocalStorage
const localStorageFunction = {
  get(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

// show login when user is not logged in
const showLogin = () => {
  if (!localStorageFunction.get("token")) {
    // show login
    login.classList.remove("hidden");
  } else {
    // hide login
    login.classList.add("hidden");
  }
};

// Función submitLogin
function submitLogin(e) {
  e.preventDefault();
  error.innerHTML = "";
  const params = JSON.stringify({
    email: email.value,
    password: password.value,
  });
  fetchLogin(params);
}

// Función logout
function logout() {
  localStorageFunction.remove("token");
  containerOrganization.innerHTML = "";
  showLogin();
}

// Función handleCreate
function handleCreate(e) {
  e.preventDefault();
  var formData = new FormData();
  formData.append("data[type]", "organizations");
  formData.append("data[attributes][name]", nameCreate.value);
  formData.append("data[attributes][alias_name]", aliasNameCreate.value);
  formData.append("data[attributes][organization_type_id]", "2");
  formData.append("data[attributes][subcategory_id]", "286");

  if (e.target.dataset.id) {
    // edit
    const id = e.target.dataset.id;
    var params = JSON.stringify({
      data: {
        id: id,
        type: "organizations",
        attributes: {
          name: nameCreate.value,
          alias_name: aliasNameCreate.value,
          organization_type_id: 2,
          subcategory_id: 92,
        },
      },
    });
    const url = BASE_URL + DEL_PUT_ORGANIZATION.replace(":id", id);
    customFetch("PUT", url, params).then((data) => {
      if (data) {
        showNotification("Organization created");
        showList();
      }
      nameCreate.value = "";
      aliasNameCreate.value = "";
      createOrganization.dataset.id = "";
      createOrganization.value = "Create";
    });
  } else {
    // create
    const url = BASE_URL + POST_ORGANIZATION;
    customFetch("POST", url, formData).then((data) => {
      if (data) {
        createOrganization.dataset.id = "";
        createOrganization.value = "Create";
        showNotification("Organization created");
        showList();
      }
      showNotification("Error, can't create Organization");
    });
  }
  e.stopPropagation();
}

// Función handleOrg
function handleOrg(e) {
  if (e.target.classList.contains("delete-org")) {
    const id = e.target.dataset.id;
    const url = BASE_URL + DEL_PUT_ORGANIZATION.replace(":id", id);
    customFetch("DELETE", url).then((data) => {
      console.log(data);
      containerOrganization.innerHTML = "";
      showNotification("Organization deleted");
      showList();
    });
  } else if (e.target.classList.contains("edit-org")) {
    const id = e.target.dataset.id;
    let name = e.target.parentElement.querySelector("span").innerHTML;
    let aliasName = e.target.parentElement.querySelector("p").innerHTML;
    nameCreate.value = name;
    aliasNameCreate.value = aliasName;
    createOrganization.dataset.id = id;
    createOrganization.value = "Edit";
  }

  e.stopPropagation();
}

// Función showList
function showList() {
  const url = BASE_URL + GET_ORGANIZATION;
  customFetch("GET", url).then((data) => {
    console.log(data);
    let output = "";
    data.data.slice(0, 10).forEach(({ id, attributes }) => {
      output += `<li>${id} - <span>${attributes.name}</span> - <p>${attributes.alias_name}</p>
        <span class='edit-org' data-id='${id}'>
         O
        </span> 
        <span class='delete-org' data-id='${id}'>
          X
        </span> 
      </li>`;
    });

    containerOrganization.innerHTML = output;
  });
}

// fetch login
function fetchLogin(params) {
  fetch(BASE_URL_LOGIN + POST_LOGIN, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: params,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      error.innerHTML = "Error en el login";
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      localStorageFunction.set("token", data.token);
      showLogin();
      showList();
    })
    .catch((error) => {
      console.log("There has been a problem with your fetch operation:", error);
    });
}

// Función Mostrar notificación
function showNotification(params) {
  notification.classList.remove("hidden");
  notification.classList.add("show");
  notification.innerHTML = params;
  setTimeout(() => {
    notification.innerHTML = "";
    notification.classList.remove("show");
    notification.classList.add("hidden");
  }, 2000);
}

// custom fetch
function customFetch(type, url, data) {
  spinner.classList.add("show");
  spinner.classList.remove("hidden");
  const options = {
    method: type,
    headers: {
      Accept: "application/json",
    },
  };
  if (type === "PUT") {
    options.headers["Content-Type"] = "application/json";
  }
  if (data) {
    options.body = data;
  }
  return fetch(url, options)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      showNotification("Error in the request");
    })
    .finally(() => {
      spinner.classList.remove("show");
      spinner.classList.add("hidden");
    });
}
