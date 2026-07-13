"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/feature/user/user.service";


interface User {
  _id: string;
  name: string;
  email: string;
}


interface SidebarProps {
  setSelectedUser: (user: User) => void;
}


export default function Sidebar({
  setSelectedUser
}: SidebarProps) {


  const [users, setUsers] = useState<User[]>([]);


  useEffect(() => {

    getUsers()
      .then((data) => {
        setUsers(data);
      });

  }, []);



  return (
    <div className="w-1/3 border-r h-screen p-4">


      <h2 className="text-xl font-bold mb-4">
        Users
      </h2>


      {
        users.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className="p-3 border-b cursor-pointer"
          >

            {user.name}

          </div>
        ))
      }


    </div>
  );

}