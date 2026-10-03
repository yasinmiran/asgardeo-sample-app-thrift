import { AsgardeoSPAClient, hasAuthParamsInUrl } from "@asgardeo/browser";

const auth = AsgardeoSPAClient.getInstance();

const views = {
    loading: document.getElementById("loading"),
    error: document.getElementById("error"),
    loggedIn: document.getElementById("logged-in-view"),
    loggedOut: document.getElementById("logged-out-view"),
};

function show(view) {
    for (const [name, element] of Object.entries(views)) {
        element.style.display = name === view ? "block" : "none";
    }
}

function showError(message) {
    views.error.textContent = message;
    show("error");
}

async function start() {
    const clientId = import.meta.env.VITE_ASGARDEO_CLIENT_ID;
    const baseUrl = import.meta.env.VITE_ASGARDEO_BASE_URL;

    if (!clientId || !baseUrl) {
        showError("Set VITE_ASGARDEO_CLIENT_ID and VITE_ASGARDEO_BASE_URL in .env, then restart the dev server.");
        return;
    }

    await auth.initialize({
        clientId,
        baseUrl,
        afterSignInUrl: window.location.origin,
        afterSignOutUrl: window.location.origin,
        scopes: ["openid", "profile"],
    });

    // Asgardeo redirects back here with ?code=... after login; the second
    // signIn() call exchanges that code for tokens.
    if (hasAuthParamsInUrl()) {
        await auth.signIn();
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    show((await auth.isSignedIn()) ? "loggedIn" : "loggedOut");
}

document.getElementById("login").addEventListener("click", () => auth.signIn());
document.getElementById("logout").addEventListener("click", () => auth.signOut());

start().catch((error) => showError(error?.message ?? String(error)));
