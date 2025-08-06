"use client";

import React, { useState, useEffect } from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6">
      <h1 className="text-4xl font-bold mb-6">Welcome to G Network Services</h1>
      <p className="text-lg max-w-xl text-center">
        Advertising Panel Application - Please login or register to manage your
        advertising content.
      </p>
    </main>
  );
}
