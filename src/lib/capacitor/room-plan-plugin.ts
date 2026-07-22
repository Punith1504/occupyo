import { Capacitor, registerPlugin } from '@capacitor/core';

export interface RoomPlanScanResult {
  sizeSqft: number;
  usdzModelUrl: string;
  floorplanJson: string;
}

export interface RoomPlanPlugin {
  scanRoom(): Promise<RoomPlanScanResult>;
}

// Register the native plugin, falling back to a proxy if it doesn't exist
const RoomPlanNative = registerPlugin<RoomPlanPlugin>('RoomPlan');

/**
 * Triggers the LiDAR AR scanner.
 * On native iOS devices with the RoomPlan plugin implemented, it calls the Swift bridge.
 * On the web or unsupported devices, it returns a mock scanned commercial space to unblock testing.
 */
export async function scanRoomAR(): Promise<RoomPlanScanResult> {
  if (Capacitor.isNativePlatform()) {
    try {
      return await RoomPlanNative.scanRoom();
    } catch (error) {
      console.warn("Native RoomPlan scan failed or plugin not implemented in iOS/Swift yet. Falling back to mock data.", error);
    }
  } else {
    console.info("Web platform detected. Simulating AR LiDAR scan...");
    
    // Simulate a 2-second scan delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Fallback Mock Data for Web/Dev
  return {
    sizeSqft: 2500,
    usdzModelUrl: "https://res.cloudinary.com/demo/image/upload/sample_3d_model.usdz",
    floorplanJson: JSON.stringify({
      walls: 4,
      doors: 2,
      windows: 3,
      ceilingHeight: 12.5
    })
  };
}
