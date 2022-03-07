var authClient = AsgardeoAuth.AsgardeoSPAClient.getInstance();
authClient.initialize(authConfig);

var state = {
    isAuth: false,
    authenticateResponse: null,
    idToken: null
};

authClient.on("sign-in", function (response) {
    var username = response?.username?.split("/");
    if (username?.length >= 2) {
        username.shift();
        response.username = username.join("/");
    }
    updateView();
    setAuthenticatedState(response);
});

authClient.on("sign-out", function (response) {
    state.isAuth = false;
    updateView();
});

function parseIdToken(idToken) {
    if (!idToken) {
        return;
    }
    if (typeof idToken !== "string") {
        idToken = JSON.stringify(idToken);
    }
    const idTokenSplit = idToken.split(".");
    let idTokenObject = {
        "encoded": [],
        "decoded": []
    };
    idTokenSplit.forEach(function (element) {
        idTokenObject["encoded"].push(element);
    });

    idTokenObject["decoded"].push(JSON.parse(atob(idTokenObject.encoded[0])));
    idTokenObject["decoded"].push(JSON.parse(atob(idTokenObject.encoded[1])));

    var sub = idTokenObject["decoded"][1] && idTokenObject["decoded"][1]?.sub?.split("/");

    if (sub.length >= 2) {
        sub.shift();
        idTokenObject["decoded"][1].sub = sub.join("/");
    }

    const groups = [];
    idTokenObject["decoded"][1] && typeof idTokenObject["decoded"][1]?.groups === "string" &&
        groups.push(idTokenObject["decoded"][1]?.groups);

    idTokenObject["decoded"][1] && typeof idTokenObject["decoded"][1]?.groups !== "string" &&
        idTokenObject["decoded"][1]?.groups?.forEach((group) => {
            const groupArrays = group.split("/");

            if (groupArrays.length >= 2) {
                groupArrays.shift();
                groups.push(groupArrays.join("/"));
            } else {
                groups.push(group);
            }
        });

    if (idTokenObject["decoded"][1]?.groups) {
        idTokenObject["decoded"][1].groups = groups;
    }

    return idTokenObject;
}

function updateView() {

    var loggedInView = document.getElementById("logged-in-view");
    var loggedOutView = document.getElementById("logged-out-view");

    if (state.isAuth) {
        loggedInView.style.display = "block";
        loggedOutView.style.display = "none";
    } else {
        loggedInView.style.display = "none";
        loggedOutView.style.display = "block";
    }
    document.getElementById("loading").style.display = "none";
    document.getElementById("error").style.display = "none";

}

function setAuthenticatedState(response) {
    authClient.getIDToken().then((idToken) => {
        state.authenticateResponse = response;
        state.idToken = parseIdToken(idToken);
        sessionStorage.setItem("authenticateResponse", JSON.stringify(response));
        state.isAuth = true;
        updateView();
    });
}

function handleLogin() {
    authClient.signIn();
}

function handleLogout() {
    authClient.signOut();
}

// Check if the page redirected by the sign-in method with authorization code, if
// it is recall sing-in method to continue the sign-in flow.
authClient.signIn({ callOnlyOnRedirect: true }).catch(() => {
    document.getElementById("loading").style.display = "none";
    document.getElementById("error").style.display = "block";
});

authClient.isAuthenticated().then(function (isAuthenticated) {
    if (isAuthenticated) {
        authClient.getIDToken().then(function (idToken) {
            state.authenticateResponse = JSON.parse(sessionStorage.getItem("authenticateResponse"));
            state.idToken = parseIdToken(idToken);
            state.isAuth = true;
            updateView();
        });
    } else {
        updateView();
    }
});
