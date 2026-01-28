import React, { useState } from "react";

export default function UserCreate({ onCreate }) {
	const [form, setForm] = useState({ email: "", first_name: "", last_name: "", role: "USER" });
	const [error, setError] = useState("");

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.email || !form.first_name || !form.last_name) {
			setError("Veuillez remplir tous les champs obligatoires.");
			return;
		}
		setError("");
		// pour l'instant on renvoie les données au parent via onCreate ou on affiche
		if (onCreate) onCreate(form);
		else alert(`Nouvel utilisateur:\n${JSON.stringify(form, null, 2)}`);
		setForm({ email: "", first_name: "", last_name: "", role: "USER" });
	};

	return (
		<div>
			<h2>Créer un utilisateur</h2>
			<form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
				<div style={{ marginBottom: 8 }}>
					<label>Email *</label>
					<br />
					<input name="email" value={form.email} onChange={handleChange} type="email" style={{ width: "100%" }} />
				</div>

				<div style={{ marginBottom: 8 }}>
					<label>Prénom *</label>
					<br />
					<input name="first_name" value={form.first_name} onChange={handleChange} style={{ width: "100%" }} />
				</div>

				<div style={{ marginBottom: 8 }}>
					<label>Nom *</label>
					<br />
					<input name="last_name" value={form.last_name} onChange={handleChange} style={{ width: "100%" }} />
				</div>

				<div style={{ marginBottom: 12 }}>
					<label>Rôle</label>
					<br />
					<select name="role" value={form.role} onChange={handleChange}>
						<option value="USER">USER</option>
						<option value="ADMIN">ADMIN</option>
					</select>
				</div>

				{error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

				<button type="submit">Créer</button>
			</form>
		</div>
	);
}

