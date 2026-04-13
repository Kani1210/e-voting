"use client";

import { useEffect, useRef, useState } from "react";
import { getFinger, saveFinger } from "@/services/fingerprintService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function FingerprintApp() {
  const [status, setStatus] = useState("Loading...");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  const [template, setTemplate] = useState("");
  const [image, setImage] = useState("");

  const sdkLoaded = useRef(false);

  // LOAD SDK
  useEffect(() => {
    if (sdkLoaded.current) return;
    sdkLoaded.current = true;

    const load = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });

    const init = async () => {
      try {
        await load("https://code.jquery.com/jquery-3.6.0.min.js");
        await load("/morfinauth.js");
        setStatus("SDK Ready ✔");
      } catch {
        setStatus("SDK Load Failed ❌");
      }
    };

    init();
  }, []);

  // DEVICE
  const getDevices = () => {
    try {
      const res = window.GetConnectedDeviceList();

      if (!res?.httpStaus || res.data.ErrorCode != 0) {
        setStatus("Device Error ❌");
        return;
      }

      const raw = res.data.ErrorDescription;
      const list = raw.split(":")[1].split(",").map((d) => d.trim());

      setDevices(list);
      setSelectedDevice(list[0]);
      setStatus("Device Loaded ✔");
    } catch {
      setStatus("SDK Not Ready ❌");
    }
  };

  const initDevice = () => {
    const res = window.InitDevice(selectedDevice, "");

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Init Failed ❌");
      return;
    }

    setStatus("Device Ready ✔");
  };

  const capture = () => {
    const res = window.CaptureFinger(60, 10);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Capture Failed ❌");
      return;
    }

    setImage("data:image/bmp;base64," + res.data.BitmapData);
    setStatus("Captured ✔");
  };

  const getTemplate = () => {
    const res = window.GetTemplate(0);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Template Error ❌");
      return;
    }

    const tpl =
      res.data.TemplateData ||
      res.data.FMRData ||
      res.data.ImgData;

    setTemplate(tpl.trim());
    setStatus("Template Ready ✔");
  };

  const save = async () => {
    const data = await saveFinger(template);
    setStatus(data.success ? "Saved ✔" : data.message || "Save Failed ❌");
  };

  const verify = async () => {
    const res = await getFinger();

    if (!res.success) {
      setStatus(res.message || "No fingerprint found ❌");
      return;
    }

    const storedTemplate = res.template;

    if (!template) {
      setStatus("No current template ❌");
      return;
    }

    const match = window.VerifyFinger(template, storedTemplate, 0);

    if (match?.httpStaus && match.data?.Status) {
      setStatus("MATCH SUCCESS ✔");
    } else {
      setStatus("NOT MATCHED ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">

        {/* HEADER */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Fingerprint System</CardTitle>
            <Badge variant="outline">{status}</Badge>
          </CardHeader>
        </Card>

        {/* DEVICE CONTROLS */}
        <Card>
          <CardContent className="flex flex-wrap gap-3 items-center p-4">
            <Button onClick={getDevices}>Get Devices</Button>

            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select Device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((d, i) => (
                  <SelectItem key={i} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={initDevice} variant="secondary">Init</Button>
            <Button onClick={capture}>Capture</Button>
            <Button onClick={getTemplate} variant="outline">Template</Button>
            <Button onClick={save} className="bg-green-600">Save</Button>
            <Button onClick={verify} className="bg-blue-600">Verify</Button>
          </CardContent>
        </Card>

        {/* MAIN VIEW */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* IMAGE PREVIEW BOX */}
          <Card>
            <CardHeader>
              <CardTitle>Fingerprint Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px] bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt="fingerprint"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-500">No Scan Yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TEMPLATE BOX */}
          <Card>
            <CardHeader>
              <CardTitle>Template Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={template}
                readOnly
                className="h-[250px] resize-none"
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}