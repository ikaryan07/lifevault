"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Contrast, Globe } from "lucide-react";
import { SUPPORTED_LOCALES } from "@/lib/i18n/translations";
import { useI18n } from "@/lib/i18n/provider";
import { PageTransition } from "@/components/motion/page-transition";
import { toast } from "sonner";

const STORAGE_KEY = "lifevault:accessibility";

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function applyToDocument(settings: AccessibilitySettings) {
  if (typeof document === "undefined") return;
  document.documentElement.style.fontSize = `${settings.fontSize}px`;
  document.documentElement.classList.toggle("high-contrast", settings.highContrast);
  document.documentElement.classList.toggle("reduce-motion", settings.reducedMotion);
}

function loadInitialSettings(): AccessibilitySettings {
  if (typeof window === "undefined") {
    return { fontSize: 17, highContrast: false, reducedMotion: false };
  }
  return safeParse<AccessibilitySettings>(
    localStorage.getItem(STORAGE_KEY),
    { fontSize: 17, highContrast: false, reducedMotion: false }
  );
}

export default function AccessibilitySettingsPage() {
  const { locale, setLocale } = useI18n();
  const initial = loadInitialSettings();
  const [fontSize, setFontSize] = useState(initial.fontSize);
  const [highContrast, setHighContrast] = useState(initial.highContrast);
  const [reducedMotion, setReducedMotion] = useState(initial.reducedMotion);

  // Live-apply changes as the user moves controls so they can preview the effect.
  useEffect(() => {
    applyToDocument({ fontSize, highContrast, reducedMotion });
  }, [fontSize, highContrast, reducedMotion]);

  function saveSettings() {
    const settings = { fontSize, highContrast, reducedMotion };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyToDocument(settings);
    toast.success("Accessibility settings saved");
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accessibility</h1>
          <p className="mt-1 text-muted-foreground">
            Adjust the app to suit your needs. These settings are saved on this device.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Text Size</CardTitle>
                <CardDescription>Make text larger or smaller.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-12">{fontSize}px</span>
              <input
                type="range"
                min={14}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1"
              />
            </div>
            <p style={{ fontSize: `${fontSize}px` }} className="rounded-lg border p-3">
              This is what your text will look like at this size.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Contrast className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Display</CardTitle>
                <CardDescription>Visual adjustments.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">High contrast</span>
                <p className="text-xs text-muted-foreground">Stronger borders and bolder text</p>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-5 w-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Reduce motion</span>
                <p className="text-xs text-muted-foreground">Less animation and movement</p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-5 w-5 rounded"
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Language</CardTitle>
                <CardDescription>Choose your preferred language.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    locale === l.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium">{l.nativeName}</p>
                  <p className="text-xs text-muted-foreground">{l.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={saveSettings} size="lg">
            Save Preferences
          </Button>
          <p className="text-xs text-muted-foreground">
            Changes preview live. Save to keep them across sessions.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
