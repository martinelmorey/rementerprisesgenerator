// Payment.js
import React, { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../providers/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 
import Swal from 'sweetalert2';  


const Payment = () => {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div>Por favor, inicia sesión para comprar creditos.</div>;
  }

  const amounts = [
    { value: 3, points: 12 },
    { value: 5, points: 20 },
    { value: 10, points: 40 },
    { value: 20, points: 80 },
    { value: 40, points: 160 },
  ];

  const handleApprove = async (orderId) => {
    try {
      if (!currentUser) {
        console.error('Usuario no autenticado');
        Swal.fire({
          title: 'Iniciar sesión requerida',
          text: 'Debes iniciar sesión para completar la compra.',
          icon: 'warning',
          confirmButtonText: 'Iniciar sesión'
        });
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const selectedOption = amounts.find(a => a.value === selectedAmount);
      const pointsToAdd = selectedOption.points;

      // Update the user's points and change the subscriptionStatus to 'paid'
      await updateDoc(userRef, {
        points: increment(pointsToAdd),
        subscriptionStatus: 'paid' 
      });

      Swal.fire({
        title: '¡Pago exitoso!',
        text: `Se han agregado ${pointsToAdd} créditos a tu cuenta.`,
        icon: 'success',
        confirmButtonText: 'Entendido'
      });
      
    } catch (error) {
      console.error('Error al actualizar los creditos del usuario:', error);

      Swal.fire({
        title: 'Error en el pago',
        text: 'Hubo un error al procesar tu pago. Por favor, contacta al soporte.',
        icon: 'error',
        confirmButtonText: 'Contactar Soporte'
      });
      
    }
  };
  

  return (
    <div className="payment-container">
      <h1 className="text-center mb-4">Compra créditos aquí</h1>
      <p>¡Adquiere créditos para generar imágenes sorprendentes y da vida a tus ideas! Compra ahora y comienza a crear.</p>
      <div className="row justify-content-center">
        {amounts.map((amount) => (
          <div className="col-6 col-sm-4 col-md-4 mb-3" key={amount.value}>
            <div
              className={`card payment-card ${selectedAmount === amount.value ? 'selected' : ''}`}
              onClick={() => setSelectedAmount(amount.value)}
            >
              <div className="card-body text-center">
                <h5 className="card-title">${amount.value} USD</h5>
                <p className="card-text">{amount.points} Créditos / Imágenes</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <PayPalButtons
          key={`paypal-button-${selectedAmount}`}
          style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal', height: 35 }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: selectedAmount.toString(),
                  },
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            await actions.order.capture();
            handleApprove(data.orderID);
          }}
          onError={(err) => {
            console.error('Error en el proceso de pago:', err);

            Swal.fire({
              title: 'Error en el pago',
              text: 'Hubo un error al procesar tu pago. Por favor, inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Intentar de nuevo'
            });
            
          }}
        />
      </div>
    </div>
  );
};

export default Payment;
