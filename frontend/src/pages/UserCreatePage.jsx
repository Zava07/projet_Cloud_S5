import React from "react";
import UserCreate from "../crud-authentification/user-create.jsx";

export default function UserCreatePage({ onCreate, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 12 }}>← Retour</button>
      <UserCreate onCreate={onCreate} />
    </div>
  );
}
