import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const { userId } = useParams();

  const profileId = userId || user?.id;

  const profileUser = {
    id: profileId,
    name: profileId === user?.id ? user?.name : "Other User"
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Profil uživatele
      </h1>

      <div className="bg-card p-4 rounded-xl">
        <p><strong>ID:</strong> {profileUser.id}</p>
        <p><strong>Jméno:</strong> {profileUser.name}</p>
      </div>
    </div>
  );
}