import React from "react";
import UserEdit from "../crud-authentification/user-edit.jsx";

export default function UserEditPage({ user, onSave, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 12 }}>← Retour</button>
      <UserEdit user={user} onSave={onSave} onCancel={onBack} />
    </div>
  );
}
