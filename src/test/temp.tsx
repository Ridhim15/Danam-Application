"use client"

import { useState } from "react"
import Image from "next/image"
import { Package, Book, Shirt, AmbulanceIcon as FirstAid, Users, Home, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export default function NGODashboard() {
  const [activeTab, setActiveTab] = useState("home")

  // Sample data for donation items
  const donationItems = [
    {
      name: "Packaged Food",
      icon: Package,
      count: 156,
      color: "#F8D3A7",
    },
    {
      name: "Books",
      icon: Book,
      count: 89,
      color: "#FF6B6B",
    },
    {
      name: "Clothes",
      icon: Shirt,
      count: 213,
      color: "#FFB347",
    },
    {
      name: "Medical Aid",
      icon: FirstAid,
      count: 42,
      color: "#77DD77",
    },
  ]

  // Sample data for volunteers
  const volunteers = [
    {
      name: "Rahul Sharma",
      email: "rahul@volunteer.org",
      avatar: "/placeholder.svg?height=40&width=40",
      area: "North Delhi",
    },
    {
      name: "Priya Singh",
      email: "priya@volunteer.org",
      avatar: "/placeholder.svg?height=40&width=40",
      area: "South Delhi",
    },
    {
      name: "Amit Kumar",
      email: "amit@volunteer.org",
      avatar: "/placeholder.svg?height=40&width=40",
      area: "East Delhi",
    },
  ]

  // Calculate total donations
  const totalDonations = donationItems.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f0ff]">
      {/* Header */}
      <header className="flex justify-between items-center p-3 bg-[#8a4baf] text-white">
        <h1 className="text-xl sm:text-2xl font-bold">Danam</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">49%</span>
          <div className="w-5 h-5 bg-white/20 rounded-full"></div>
        </div>
      </header>

      {/* NGO Info */}
      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-[#8a4baf]">
            <AvatarImage src="/placeholder.svg?height=64&width=64" alt="NGO Logo" />
            <AvatarFallback className="bg-[#8a4baf] text-white">KV</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#8a4baf]">Kalpvriksh - Ek Chota Prayas NGO</h2>
            <p className="text-sm text-gray-600">kalpvriksh@ngo.org</p>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className="relative w-full h-36 sm:h-48 mb-2 px-3">
        <Image
          src="/placeholder.svg?height=200&width=600"
          alt="Children smiling"
          className="rounded-xl object-cover"
          fill
        />
        <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
          <p className="text-white text-center text-base sm:text-xl px-4 sm:px-6 font-medium">
            Your Donations can change lives. Join us in our mission to help those in need
          </p>
        </div>
      </div>

      {/* Donation Stats */}
      <div className="px-3 py-2">
        <h3 className="text-lg sm:text-xl font-bold text-[#8a4baf] mb-2 sm:mb-3">Donation Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {donationItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4 flex flex-col items-center">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-[#8a4baf]">{item.name}</h4>
                <div className="mt-2 w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Items</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                  <Progress
                    value={(item.count / totalDonations) * 100}
                    className="h-2"
                    indicatorClassName="bg-[#8a4baf]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total Donations */}
        <Card className="mt-4 bg-[#8a4baf] text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Total Donations</h3>
              <span className="text-2xl font-bold">{totalDonations}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volunteers List */}
      <div className="px-3 py-2 mt-2 flex-1">
        <h3 className="text-lg sm:text-xl font-bold text-[#8a4baf] mb-2 sm:mb-3">List of Volunteers</h3>
        <Card>
          <CardContent className="p-0">
            {volunteers.map((volunteer, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 ${index < volunteers.length - 1 ? "border-b" : ""}`}
              >
                <Avatar>
                  <AvatarImage src={volunteer.avatar || "/placeholder.svg"} alt={volunteer.name} />
                  <AvatarFallback className="bg-[#8a4baf] text-white">
                    {volunteer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#8a4baf]">{volunteer.name}</h4>
                  <p className="text-sm text-gray-600">{volunteer.email}</p>
                  <p className="text-xs text-gray-500">Area: {volunteer.area}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-auto grid grid-cols-3 border-t bg-white">
        <button
          className={`flex flex-col items-center justify-center py-3 ${
            activeTab === "community" ? "text-[#8a4baf]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("community")}
        >
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Community</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center py-3 ${
            activeTab === "home" ? "text-[#8a4baf]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("home")}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center py-3 ${
            activeTab === "profile" ? "text-[#8a4baf]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  )
}