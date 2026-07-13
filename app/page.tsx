"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default function Home(){
const [selectedUser,setSelectedUser]=useState<any>(null);

return(
<div className="flex">
<Sidebar setSelectedUser={setSelectedUser}/>
<ChatWindow selectedUser={selectedUser}/>
</div>
)
}