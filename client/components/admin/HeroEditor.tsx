"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, ChevronUp, ChevronDown, Copy } from "lucide-react"
import type { CreateHeroDto, HeroSlideDto } from "@ggm/types"
import { createHeroSchema } from "@ggm/types"
import { PageHeader } from "@/components/shared/PageHeader"
import { HeroRenderer } from "@/components/hero/HeroRenderer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/shared/GlassCard"
import { fromLagosDateTimeInput, toLagosDateTimeInput } from "@/lib/date"
import { OptionCardGroup } from "@/components/shared/OptionCardGroup"
import { ImageUploadField } from "@/components/shared/ImageUploadField"

const newSlide = (sortOrder: number): HeroSlideDto => ({
  sortOrder,
  layout: "TEXT_ONLY",
  align: "START",
  title: "Welcome to Grace of God Mission",
  subtitle: "Join us for worship and fellowship.",
  primaryLabel: "Plan a visit",
  primaryUrl: "/visit",
  secondaryLabel: null,
  secondaryUrl: null,
  bgType: "COLOR",
  bgColor: "#141633",
  bgGradient: null,
  imageUrl: null,
  mobileImageUrl: null,
  imageAlt: null,
  imageDecorative: true,
  focalX: 50,
  focalY: 50,
  overlay: 40,
  textTone: "LIGHT",
})
const colorPresets = [
  { label: "Midnight", value: "#141633" },
  { label: "Indigo", value: "#2E3192" },
  { label: "Sky", value: "#DCE6F7" },
  { label: "Gold", value: "#D9A441" },
  { label: "Paper", value: "#FAFAF7" },
]
function contrastRatio(background: string, foreground: string) {
  const luminance = (hex: string) => {
    const channels = hex.match(/[A-Fa-f0-9]{2}/g)?.map((part) => parseInt(part, 16) / 255)
    if (!channels || channels.length !== 3) return null
    const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
  }
  const bg = luminance(background)
  const fg = luminance(foreground)
  if (bg === null || fg === null) return null
  const [lighter, darker] = bg > fg ? [bg, fg] : [fg, bg]
  return (lighter + 0.05) / (darker + 0.05)
}
const blankHero = (): CreateHeroDto => ({
  name: "New hero",
  mode: "SINGLE",
  autoplay: false,
  intervalSeconds: 7,
  published: false,
  startsAt: null,
  endsAt: null,
  slides: [newSlide(0)],
})
const dateValue = (value: string | null | undefined) =>
  toLagosDateTimeInput(value)
const nullable = (value: string) => (value.trim() ? value : null)

export function HeroEditor({ id }: { id: string }) {
  const router = useRouter()
  const isNew = id === "new"
  const [hero, setHero] = useState<CreateHeroDto>(blankHero)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [previewMobile, setPreviewMobile] = useState(false)
  useEffect(() => {
    if (isNew) return
    let cancelled = false
    fetch(`/api/v1/admin/hero/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load the hero.")
        return response.json()
      })
      .then(({ data }) => {
        if (!cancelled)
          setHero({
            ...data,
            startsAt: data.startsAt ?? null,
            endsAt: data.endsAt ?? null,
          })
      })
      .catch((error) => toast.error(error.message))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, isNew])
  const setSlide = (index: number, updates: Partial<HeroSlideDto>) =>
    setHero((current) => ({
      ...current,
      slides: current.slides.map((slide, i) =>
        i === index ? { ...slide, ...updates } : slide
      ),
    }))
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = {
      ...hero,
      startsAt: fromLagosDateTimeInput(hero.startsAt ?? ""),
      endsAt: fromLagosDateTimeInput(hero.endsAt ?? ""),
      slides: hero.slides.map((slide, index) => ({
        ...slide,
        sortOrder: index,
      })),
    }
    const parsed = createHeroSchema.safeParse(payload)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Review the hero fields.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch(
        isNew
          ? "/api/v1/admin/hero"
          : `/api/v1/admin/hero/${encodeURIComponent(id)}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      )
      const result = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(result?.message ?? "Unable to save this hero.")
      toast.success(
        "Hero saved as a draft. Review the preview, then publish it from the hero list."
      )
      router.push("/admin/hero")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save this hero."
      )
    } finally {
      setSaving(false)
    }
  }
  if (loading)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        Loading hero…
      </p>
    )
  return (
    <div className="space-y-8">
      <PageHeader
        title={isNew ? "Create hero" : "Edit hero"}
        description="Build a welcome slide, choose its schedule, and preview the real public hero renderer."
      />
      <form onSubmit={submit} className="space-y-8 pb-24">
        <GlassCard surface="solid" padding="lg" className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="hero-name">Hero name</Label>
            <Input
              id="hero-name"
              required
              maxLength={120}
              value={hero.name}
              onChange={(event) =>
                setHero({ ...hero, name: event.target.value })
              }
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hero-mode">Mode</Label>
              <OptionCardGroup
                aria-label="Hero mode"
                value={hero.mode}
                onValueChange={(mode) => setHero({ ...hero, mode: mode as CreateHeroDto["mode"] })}
                className="grid-cols-1"
                options={[
                  { value: "SINGLE", label: "Single slide", description: "One welcome message at a time." },
                  { value: "CAROUSEL", label: "Carousel", description: "Rotate through multiple welcome messages." },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-interval">Carousel interval (seconds)</Label>
              <Input
                id="hero-interval"
                type="number"
                min={5}
                max={15}
                value={hero.intervalSeconds}
                onChange={(event) =>
                  setHero({
                    ...hero,
                    intervalSeconds: Number(event.target.value),
                  })
                }
              />
            </div>
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                className="size-5 accent-primary"
                checked={hero.autoplay}
                onChange={(event) =>
                  setHero({ ...hero, autoplay: event.target.checked })
                }
              />
              Autoplay (respects reduced motion)
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hero-start">
                Start time (Africa/Lagos local)
              </Label>
              <Input
                id="hero-start"
                type="datetime-local"
                value={dateValue(hero.startsAt)}
                onChange={(event) =>
                  setHero({ ...hero, startsAt: nullable(event.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-end">End time (Africa/Lagos local)</Label>
              <Input
                id="hero-end"
                type="datetime-local"
                value={dateValue(hero.endsAt)}
                onChange={(event) =>
                  setHero({ ...hero, endsAt: nullable(event.target.value) })
                }
              />
            </div>
          </div>
        </GlassCard>
        {hero.slides.map((slide, index) => (
          <GlassCard
            key={index}
            surface="solid"
            padding="lg"
            className="space-y-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">Slide {index + 1}</h2>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Move slide up"
                  disabled={index === 0}
                  onClick={() =>
                    setHero({
                      ...hero,
                      slides: hero.slides
                        .map((item, i, all) =>
                          i === index
                            ? all[index - 1]
                            : i === index - 1
                              ? all[index]
                              : item
                        )
                        .map((item, i) => ({ ...item, sortOrder: i })),
                    })
                  }
                >
                  <ChevronUp />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Move slide down"
                  disabled={index === hero.slides.length - 1}
                  onClick={() =>
                    setHero({
                      ...hero,
                      slides: hero.slides
                        .map((item, i, all) =>
                          i === index
                            ? all[index + 1]
                            : i === index + 1
                              ? all[index]
                              : item
                        )
                        .map((item, i) => ({ ...item, sortOrder: i })),
                    })
                  }
                >
                  <ChevronDown />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Duplicate slide"
                  disabled={hero.slides.length >= 6}
                  onClick={() =>
                    setHero({
                      ...hero,
                      slides: [
                        ...hero.slides.slice(0, index + 1),
                        { ...slide, id: undefined, sortOrder: index + 1 },
                        ...hero.slides.slice(index + 1),
                      ].map((item, i) => ({ ...item, sortOrder: i })),
                    })
                  }
                >
                  <Copy />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Delete slide"
                  disabled={hero.slides.length <= 1}
                  onClick={() =>
                    setHero({
                      ...hero,
                      slides: hero.slides
                        .filter((_, i) => i !== index)
                        .map((item, i) => ({ ...item, sortOrder: i })),
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`slide-title-${index}`}>Title</Label>
                <Input
                  id={`slide-title-${index}`}
                  required
                  maxLength={80}
                  value={slide.title}
                  onChange={(event) =>
                    setSlide(index, { title: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`slide-subtitle-${index}`}>Subtitle</Label>
                <Input
                  id={`slide-subtitle-${index}`}
                  maxLength={200}
                  value={slide.subtitle ?? ""}
                  onChange={(event) =>
                    setSlide(index, { subtitle: nullable(event.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Layout</Label>
                <OptionCardGroup
                  aria-label={`Slide ${index + 1} layout`}
                  value={slide.layout}
                  className="grid-cols-1"
                  onValueChange={(value) => {
                    const layout = value as HeroSlideDto["layout"]
                    setSlide(index, {
                      layout,
                      bgType:
                        layout === "SPLIT" || layout === "TEXT_ONLY"
                          ? "COLOR"
                          : slide.bgType,
                      imageUrl: layout === "TEXT_ONLY" ? null : slide.imageUrl,
                    })
                  }}
                  options={[
                    { value: "TEXT_ONLY", label: "Text only", description: "A message on a solid colour or gradient." },
                    { value: "FULL_BLEED", label: "Full bleed", description: "A full-width image or background." },
                    { value: "SPLIT", label: "Split with image", description: "Message beside a supporting image." },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <select
                  className="min-h-11 w-full rounded-md border border-input bg-background px-3"
                  value={slide.align}
                  onChange={(event) =>
                    setSlide(index, {
                      align: event.target.value as HeroSlideDto["align"],
                    })
                  }
                >
                  <option value="START">Start</option>
                  <option value="CENTER">Center</option>
                  <option value="END">End</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Background</Label>
                <select
                  className="min-h-11 w-full rounded-md border border-input bg-background px-3"
                  value={slide.bgType}
                  onChange={(event) =>
                    setSlide(index, {
                      bgType: event.target.value as HeroSlideDto["bgType"],
                      imageUrl:
                        event.target.value === "IMAGE"
                          ? slide.imageUrl
                          : slide.layout === "SPLIT"
                            ? slide.imageUrl
                            : null,
                      bgColor: "#141633",
                      bgGradient: null,
                    })
                  }
                >
                  <option value="COLOR">Solid colour</option>
                  <option value="GRADIENT">Gradient</option>
                  {slide.layout === "FULL_BLEED" && (
                    <option value="IMAGE">Image background</option>
                  )}
                </select>
              </div>
              {slide.bgType === "COLOR" ? (
                <div className="space-y-2">
                  <Label>Background colour</Label>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Background colour presets">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        aria-label={`Use ${preset.label} background colour`}
                        aria-pressed={slide.bgColor?.toUpperCase() === preset.value}
                        title={preset.label}
                        onClick={() => setSlide(index, { bgColor: preset.value })}
                        className="size-11 rounded-full border-2 border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        style={{ backgroundColor: preset.value }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <Input
                      type="color"
                      aria-label="Choose background colour"
                      value={/^#[0-9a-f]{6}$/i.test(slide.bgColor ?? "") ? slide.bgColor! : "#141633"}
                      onChange={(event) => setSlide(index, { bgColor: event.target.value })}
                      className="h-11 w-16 p-1"
                    />
                    <Input
                      aria-label="Background colour hex"
                      value={slide.bgColor ?? "#141633"}
                      maxLength={7}
                      onChange={(event) => setSlide(index, { bgColor: event.target.value })}
                    />
                  </div>
                  {(() => {
                    const ratio = contrastRatio(slide.bgColor ?? "#141633", slide.textTone === "LIGHT" ? "#FFFFFF" : "#141633")
                    if (ratio === null) return <p role="alert" className="text-sm text-destructive">Enter a valid six-digit hex colour.</p>
                    return <p role="status" className={`text-sm ${ratio < 4.5 ? "text-destructive" : "text-muted-foreground"}`}>
                      Contrast {ratio.toFixed(2)}:1 {ratio < 4.5 ? "· Below the 4.5:1 publishing requirement" : "· Meets the 4.5:1 requirement"}
                    </p>
                  })()}
                </div>
              ) : slide.bgType === "GRADIENT" ? (
                <div className="space-y-2">
                  <Label>Gradient preset</Label>
                  <select
                    className="min-h-11 w-full rounded-md border border-input bg-background px-3"
                    value={slide.bgGradient ?? "dawn"}
                    onChange={(event) =>
                      setSlide(index, {
                        bgGradient: event.target
                          .value as HeroSlideDto["bgGradient"],
                      })
                    }
                  >
                    <option value="dawn">Dawn</option>
                    <option value="daybreak">Daybreak</option>
                    <option value="glow">Glow</option>
                  </select>
                </div>
              ) : null}
              {(slide.bgType === "IMAGE" || slide.layout === "SPLIT") && (
                <ImageUploadField
                  label={slide.layout === "SPLIT" ? "Split image" : "Background image"}
                  value={slide.imageUrl ?? ""}
                  scope="hero"
                  required={slide.layout === "SPLIT" || (slide.bgType === "IMAGE" && slide.layout === "FULL_BLEED")}
                  onChange={(url) => setSlide(index, { imageUrl: nullable(url) })}
                />
              )}
              {slide.imageUrl && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`slide-image-alt-${index}`}>Image description</Label>
                    <Input
                      id={`slide-image-alt-${index}`}
                      value={slide.imageAlt ?? ""}
                      onChange={(event) =>
                        setSlide(index, {
                          imageAlt: nullable(event.target.value),
                          imageDecorative: false,
                        })
                      }
                    />
                  </div>
                  <label className="flex min-h-11 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={slide.imageDecorative}
                      onChange={(event) =>
                        setSlide(index, {
                          imageDecorative: event.target.checked,
                        })
                      }
                    />
                    Decorative image
                  </label>
                  {slide.bgType === "IMAGE" && slide.layout === "FULL_BLEED" && (
                    <ImageUploadField
                      label="Mobile image (optional)"
                      value={slide.mobileImageUrl ?? ""}
                      scope="hero"
                      onChange={(url) => setSlide(index, { mobileImageUrl: nullable(url) })}
                    />
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`focal-x-${index}`}>Image focal point — horizontal</Label>
                      <Input id={`focal-x-${index}`} type="range" min={0} max={100} value={slide.focalX} onChange={(event) => setSlide(index, { focalX: Number(event.target.value) })} />
                      <span className="text-xs text-muted-foreground">{slide.focalX}%</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`focal-y-${index}`}>Image focal point — vertical</Label>
                      <Input id={`focal-y-${index}`} type="range" min={0} max={100} value={slide.focalY} onChange={(event) => setSlide(index, { focalY: Number(event.target.value) })} />
                      <span className="text-xs text-muted-foreground">{slide.focalY}%</span>
                    </div>
                  </div>
                  {slide.bgType === "IMAGE" && (
                    <div className="space-y-2">
                      <Label htmlFor={`slide-overlay-${index}`}>Overlay strength</Label>
                      <Input
                        id={`slide-overlay-${index}`}
                        type="range"
                        min={0}
                        max={80}
                        value={slide.overlay}
                        onChange={(event) =>
                          setSlide(index, {
                            overlay: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </>
              )}
              <div className="space-y-2">
                <Label>Text tone</Label>
                <select
                  className="min-h-11 w-full rounded-md border border-input bg-background px-3"
                  value={slide.textTone}
                  onChange={(event) =>
                    setSlide(index, {
                      textTone: event.target.value as HeroSlideDto["textTone"],
                    })
                  }
                >
                  <option value="LIGHT">Light</option>
                  <option value="DARK">Dark</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Primary action</Label>
                  <Input
                    placeholder="Button label"
                    value={slide.primaryLabel ?? ""}
                    onChange={(event) =>
                      setSlide(index, {
                        primaryLabel: nullable(event.target.value),
                      })
                    }
                  />
                  <Input
                    aria-label="Primary action link"
                    placeholder="/visit or https://…"
                    value={slide.primaryUrl ?? ""}
                    onChange={(event) =>
                      setSlide(index, {
                        primaryUrl: nullable(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary action</Label>
                  <Input
                    placeholder="Button label"
                    value={slide.secondaryLabel ?? ""}
                    onChange={(event) =>
                      setSlide(index, {
                        secondaryLabel: nullable(event.target.value),
                      })
                    }
                  />
                  <Input
                    aria-label="Secondary action link"
                    placeholder="/sermons or https://…"
                    value={slide.secondaryUrl ?? ""}
                    onChange={(event) =>
                      setSlide(index, {
                        secondaryUrl: nullable(event.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
        {hero.slides.length < 6 && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setHero({
                ...hero,
                slides: [...hero.slides, newSlide(hero.slides.length)],
              })
            }
          >
            <Plus className="mr-2 size-4" />
            Add slide
          </Button>
        )}
        <GlassCard surface="solid" padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-display text-2xl">Live preview</h2>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={previewMobile ? "outline" : "default"}
                onClick={() => setPreviewMobile(false)}
              >
                Desktop
              </Button>
              <Button
                type="button"
                variant={previewMobile ? "default" : "outline"}
                onClick={() => setPreviewMobile(true)}
              >
                Mobile
              </Button>
            </div>
          </div>
          <div
            className={
              previewMobile
                ? "mx-auto max-w-sm overflow-hidden border-x border-border"
                : ""
            }
          >
            <HeroRenderer
              hero={{
                id,
                mode: hero.mode,
                autoplay: false,
                intervalSeconds: hero.intervalSeconds,
                slides: hero.slides,
              }}
            />
          </div>
        </GlassCard>
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-end gap-3 border-t border-border bg-background/95 p-4 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/hero")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save draft"}
          </Button>
        </div>
      </form>
    </div>
  )
}
