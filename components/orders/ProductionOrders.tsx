"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function ProductionOrders() {
  return (
    <div className="space-y-4">
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Üretim akışını görüntülemek için</p>
        <Link href="/orders/production">
          <Button>
            Üretim Panosu
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

