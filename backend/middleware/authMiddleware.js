import admin from 'firebase-admin';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado: Falta el token de autenticación.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Agrega los detalles del usuario a la solicitud
    next();
  } catch (error) {
    console.error('Error verificando el token:', error);
    return res.status(401).json({ message: 'No autorizado: Token inválido.' });
  }
};

export default authenticate;