import React, { Component } from "react";
import { auth, googleAuthProvider, signInWithPopup } from '../../firebase/firebase.js';

export default class Login extends Component {
    constructor(props) {
    super(props);
    this.state = {
      error: "",
      loading: false,
    };
  }

  handleGoogleLogin = async () => {
    const provider = googleAuthProvider;
    this.setState({ loading: true, error: "" });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result && result.user) {
        console.log('Usuario autenticado:', result.user);
        // Actualizar el estado y manejar Firestore
      }
    } catch (error) {
      console.error("Error durante el login con Google:", error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };
  

  render() {
    const { error, loading } = this.state;

    return (
      <div className="login-container">
        <div className="loginpopup">
          <div className="loginform">
            <h3><strong>¡Bienvenid@ a Rem Enterprises AI!</strong></h3>
            <p>Aquí puedes explorar y personalizar productos únicos creados con inteligencia artificial. Desde cuadros y almohadones hasta remeras, tenemos opciones que puedes diseñar a tu gusto con tecnología avanzada.</p>
            {/* Botón de inicio de sesión con Google */}
            <button id="googleicon" onClick={this.handleGoogleLogin} disabled={loading}>
              <img src="assets/images/googleicon.png" alt="Iniciar sesión" />
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            {/* Mostrar mensaje de error si ocurre */}
            {error && <div className="error">{error}</div>}
          </div>
        </div>
      </div>
    );
  }
}
