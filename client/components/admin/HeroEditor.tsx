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
import { cn } from "@/lib/utils"

const newSlide = (sortOrder: number): HeroSlideDto => ({
  sortOrder,
  layout: "FULL_BLEED",
  align: "CENTER",
  title: "A Sanctuary of Grace, Truth, and Loving Community",
  subtitle: "Connecting lives to the heart of Jesus Christ in Asaba, Delta State. Join us for spirit-filled worship, Bible-grounded teaching, and a family that walks with you in faith.",
  primaryLabel: "Plan your visit",
  primaryUrl: "/visit",
  secondaryLabel: "Watch latest sermons",
  secondaryUrl: "/sermons",
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

const sanitizeSlide = (slide: HeroSlideDto, index: number): HeroSlideDto => ({
  id: slide.id,
  sortOrder: index,
  layout: slide.layout,
  align: slide.align,
  title: slide.title,
  subtitle: slide.subtitle ?? null,
  primaryLabel: slide.primaryLabel ?? null,
  primaryUrl: slide.primaryUrl ?? null,
  secondaryLabel: slide.secondaryLabel ?? null,
  secondaryUrl: slide.secondaryUrl ?? null,
  bgType: slide.bgType,
  bgColor: slide.bgColor ?? null,
  bgGradient: slide.bgGradient ?? null,
  imageUrl: slide.imageUrl ?? null,
  mobileImageUrl: slide.mobileImageUrl ?? null,
  imageAlt: slide.imageAlt ?? null,
  imageDecorative: Boolean(slide.imageDecorative),
  focalX: slide.focalX ?? 50,
  focalY: slide.focalY ?? 50,
  overlay: slide.overlay ?? 40,
  textTone: slide.textTone ?? "LIGHT",
})

export function HeroEditor({ id }: { id: string }) {
  const router = useRouter()
  const isNew = id === "new"
  const [hero, setHero] = useState<CreateHeroDto>(blankHero)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [previewMobile, setPreviewMobile] = useState(false)
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0)
  const [previewViewMode, setPreviewViewMode] = useState<"slide" | "carousel">("slide")
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
  const setSlide = (index: number, updates: Partial<HeroSlideDto>) => {
    setPreviewSlideIndex(index)
    setPreviewViewMode("slide")
    setHero((current) => ({
      ...current,
      slides: current.slides.map((slide, i) =>
        i === index ? { ...slide, ...updates } : slide
      ),
    }))
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload: CreateHeroDto = {
      name: hero.name,
      mode: hero.mode,
      autoplay: hero.autoplay,
      intervalSeconds: hero.intervalSeconds,
      published: hero.published,
      startsAt: fromLagosDateTimeInput(hero.startsAt ?? ""),
      endsAt: fromLagosDateTimeInput(hero.endsAt ?? ""),
      slides: hero.slides.map(sanitizeSlide),
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
              name="name"
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
              <span id="hero-mode-label" className="text-sm font-medium">Mode</span>
              <OptionCardGroup
                aria-labelledby="hero-mode-label"
                name="hero_mode"
                idPrefix="hero-mode"
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
                name="intervalSeconds"
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
            <label htmlFor="hero-autoplay" className="flex min-h-11 items-center gap-3">
              <input
                id="hero-autoplay"
                name="autoplay"
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
          <div className="space-y-2">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hero-start">
                  Start time (Africa/Lagos local)
                </Label>
                <Input
                  id="hero-start"
                  name="startsAt"
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
                  name="endsAt"
                  type="datetime-local"
                  value={dateValue(hero.endsAt)}
                  onChange={(event) =>
                    setHero({ ...hero, endsAt: nullable(event.target.value) })
                  }
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional schedule: Leave both empty to display immediately upon publishing and remain active indefinitely.
            </p>
          </div>
        </GlassCard>
        {hero.slides.map((slide, index) => (
          <GlassCard
            key={index}
            surface="solid"
            padding="lg"
            className={cn(
              "space-y-5 transition-all duration-200",
              previewSlideIndex === index && "ring-2 ring-primary/40 shadow-md"
            )}
            onFocusCapture={() => {
              if (previewSlideIndex !== index) {
                setPreviewSlideIndex(index)
                setPreviewViewMode("slide")
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl">Slide {index + 1}</h2>
                {previewSlideIndex === index && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Previewing
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Move slide up"
                  disabled={index === 0}
                  onClick={() => {
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
                    setPreviewSlideIndex(index - 1)
                    setPreviewViewMode("slide")
                  }}
                >
                  <ChevronUp />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Move slide down"
                  disabled={index === hero.slides.length - 1}
                  onClick={() => {
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
                    setPreviewSlideIndex(index + 1)
                    setPreviewViewMode("slide")
                  }}
                >
                  <ChevronDown />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Duplicate slide"
                  disabled={hero.slides.length >= 6}
                  onClick={() => {
                    const nextIndex = index + 1
                    setHero({
                      ...hero,
                      slides: [
                        ...hero.slides.slice(0, index + 1),
                        { ...slide, id: undefined, sortOrder: nextIndex },
                        ...hero.slides.slice(index + 1),
                      ].map((item, i) => ({ ...item, sortOrder: i })),
                    })
                    setPreviewSlideIndex(nextIndex)
                    setPreviewViewMode("slide")
                  }}
                >
                  <Copy />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Delete slide"
                  disabled={hero.slides.length <= 1}
                  onClick={() => {
                    const nextSlides = hero.slides
                      .filter((_, i) => i !== index)
                      .map((item, i) => ({ ...item, sortOrder: i }))
                    setHero({
                      ...hero,
                      slides: nextSlides,
                    })
                    setPreviewSlideIndex((curr) => Math.min(curr, nextSlides.length - 1))
                    setPreviewViewMode("slide")
                  }}
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
                  name={`slide_${index}_title`}
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
                  name={`slide_${index}_subtitle`}
                  maxLength={200}
                  value={slide.subtitle ?? ""}
                  onChange={(event) =>
                    setSlide(index, { subtitle: nullable(event.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <span id={`slide-layout-label-${index}`} className="text-sm font-medium">Layout</span>
                <OptionCardGroup
                  aria-labelledby={`slide-layout-label-${index}`}
                  name={`slide_${index}_layout`}
                  idPrefix={`slide-layout-${index}`}
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
                <Label htmlFor={`slide-align-${index}`}>Alignment</Label>
                <select
                  id={`slide-align-${index}`}
                  name={`slide_${index}_align`}
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
                <Label htmlFor={`slide-bg-type-${index}`}>Background</Label>
                <select
                  id={`slide-bg-type-${index}`}
                  name={`slide_${index}_bg_type`}
                  className="min-h-11 w-full rounded-md border border-input bg-background px-3"
                  value={slide.bgType}
                  onChange={(event) => {
                    const nextType = event.target.value as HeroSlideDto["bgType"]
                    setSlide(index, {
                      bgType: nextType,
                      imageUrl:
                        nextType === "IMAGE"
                          ? slide.imageUrl
                          : slide.layout === "SPLIT"
                            ? slide.imageUrl
                            : null,
                      bgColor: slide.bgColor ?? "#141633",
                      bgGradient: slide.bgGradient ?? "dawn",
                    })
                  }}
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
                  <Label htmlFor={`slide-bg-color-${index}`}>Background colour</Label>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Background colour presets">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        aria-label={`Use ${preset.label} background colour`}
                        aria-pressed={slide.bgColor?.toUpperCase() === preset.value}
                        title={preset.label}
                        onClick={() => setSlide(index, { bgColor: preset.value })}
                        className={cn(
                          "size-11 rounded-full border-2 border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-transform hover:scale-105 active:scale-95",
                          slide.bgColor?.toUpperCase() === preset.value.toUpperCase() && "ring-2 ring-primary ring-offset-2 border-primary"
                        )}
                        style={{ backgroundColor: preset.value }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <Input
                      id={`slide-bg-color-picker-${index}`}
                      name={`slide_${index}_bg_color_picker`}
                      type="color"
                      aria-label="Choose background colour"
                      value={/^#[0-9a-f]{6}$/i.test(slide.bgColor ?? "") ? slide.bgColor! : "#141633"}
                      onChange={(event) => setSlide(index, { bgColor: event.target.value })}
                      className="h-11 w-16 p-1"
                    />
                    <Input
                      id={`slide-bg-color-${index}`}
                      name={`slide_${index}_bg_color`}
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
                  <Label htmlFor={`slide-bg-gradient-${index}`}>Gradient preset</Label>
                  <select
                    id={`slide-bg-gradient-${index}`}
                    name={`slide_${index}_bg_gradient`}
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
                  id={`slide-image-${index}`}
                  name={`slide_${index}_image`}
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
                      name={`slide_${index}_image_alt`}
                      value={slide.imageAlt ?? ""}
                      onChange={(event) =>
                        setSlide(index, {
                          imageAlt: nullable(event.target.value),
                          imageDecorative: false,
                        })
                      }
                    />
                  </div>
                  <label htmlFor={`slide-image-decorative-${index}`} className="flex min-h-11 items-center gap-3">
                    <input
                      id={`slide-image-decorative-${index}`}
                      name={`slide_${index}_image_decorative`}
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
                      id={`slide-mobile-image-${index}`}
                      name={`slide_${index}_mobile_image`}
                      label="Mobile image (optional)"
                      value={slide.mobileImageUrl ?? ""}
                      scope="hero"
                      onChange={(url) => setSlide(index, { mobileImageUrl: nullable(url) })}
                    />
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`focal-x-${index}`}>Image focal point — horizontal</Label>
                      <Input
                        id={`focal-x-${index}`}
                        name={`slide_${index}_focal_x`}
                        type="range"
                        min={0}
                        max={100}
                        value={slide.focalX}
                        onChange={(event) => setSlide(index, { focalX: Number(event.target.value) })}
                      />
                      <span className="text-xs text-muted-foreground">{slide.focalX}%</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`focal-y-${index}`}>Image focal point — vertical</Label>
                      <Input
                        id={`focal-y-${index}`}
                        name={`slide_${index}_focal_y`}
                        type="range"
                        min={0}
                        max={100}
                        value={slide.focalY}
                        onChange={(event) => setSlide(index, { focalY: Number(event.target.value) })}
                      />
                      <span className="text-xs text-muted-foreground">{slide.focalY}%</span>
                    </div>
                  </div>
                  {slide.bgType === "IMAGE" && (
                    <div className="space-y-2">
                      <Label htmlFor={`slide-overlay-${index}`}>Overlay strength</Label>
                      <Input
                        id={`slide-overlay-${index}`}
                        name={`slide_${index}_overlay`}
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
                <Label htmlFor={`slide-text-tone-${index}`}>Text tone</Label>
                <select
                  id={`slide-text-tone-${index}`}
                  name={`slide_${index}_text_tone`}
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
                  <Label htmlFor={`slide-primary-label-${index}`}>Primary action</Label>
                  <Input
                    id={`slide-primary-label-${index}`}
                    name={`slide_${index}_primary_label`}
                    placeholder="Button label"
                    value={slide.primaryLabel ?? ""}
                    onChange={(event) =>
                      setSlide(index, {
                        primaryLabel: nullable(event.target.value),
                      })
                    }
                  />
                  <Input
                    id={`slide-primary-url-${index}`}
                    name={`slide_${index}_primary_url`}
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
                  <Label htmlFor={`slide-secondary-label-${index}`}>Secondary action</Label>
                  <Input
                    id={`slide-secondary-label-${index}`}
                    name={`slide_${index}_secondary_label`}
                    placeholder="Button label"
                    value={slide.secondaryLabel ?? ""}
                    onChange={(event) =>
                      setSlide(index, {
                        secondaryLabel: nullable(event.target.value),
                      })
                    }
                  />
                  <Input
                    id={`slide-secondary-url-${index}`}
                    name={`slide_${index}_secondary_url`}
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
            onClick={() => {
              const nextIndex = hero.slides.length
              setHero({
                ...hero,
                slides: [...hero.slides, newSlide(nextIndex)],
              })
              setPreviewSlideIndex(nextIndex)
              setPreviewViewMode("slide")
            }}
          >
            <Plus className="mr-2 size-4" />
            Add slide
          </Button>
        )}
        <GlassCard surface="solid" padding="none" className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl">Live preview</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live sync active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hero.slides.length > 1 && (
                <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-background/50">
                  {hero.slides.map((_, i) => (
                    <Button
                      key={i}
                      type="button"
                      size="sm"
                      variant={previewViewMode === "slide" && previewSlideIndex === i ? "default" : "ghost"}
                      className="h-8 px-2.5 text-xs"
                      onClick={() => {
                        setPreviewViewMode("slide")
                        setPreviewSlideIndex(i)
                      }}
                    >
                      Slide {i + 1}
                    </Button>
                  ))}
                  {hero.mode === "CAROUSEL" && (
                    <Button
                      type="button"
                      size="sm"
                      variant={previewViewMode === "carousel" ? "default" : "ghost"}
                      className="h-8 px-2.5 text-xs"
                      onClick={() => setPreviewViewMode("carousel")}
                    >
                      Carousel
                    </Button>
                  )}
                </div>
              )}
              <div className="flex gap-1 rounded-lg border border-border p-1 bg-background/50">
                <Button
                  type="button"
                  size="sm"
                  variant={!previewMobile ? "default" : "ghost"}
                  className="h-8 px-2.5 text-xs"
                  onClick={() => setPreviewMobile(false)}
                >
                  Desktop
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={previewMobile ? "default" : "ghost"}
                  className="h-8 px-2.5 text-xs"
                  onClick={() => setPreviewMobile(true)}
                >
                  Mobile
                </Button>
              </div>
            </div>
          </div>
          <div
            className={
              previewMobile
                ? "mx-auto max-w-sm overflow-hidden border-x border-border shadow-inner"
                : "overflow-hidden"
            }
          >
            <HeroRenderer
              hero={{
                id,
                mode: hero.mode,
                autoplay: previewViewMode === "carousel" ? (hero.autoplay ?? true) : false,
                intervalSeconds: hero.intervalSeconds,
                slides: hero.slides,
              }}
              activeSlideIndex={previewViewMode === "slide" ? previewSlideIndex : undefined}
              animate={false}
            />
          </div>
        </GlassCard>
        <div className="sticky bottom-0 z-30 -mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-8 flex justify-end gap-3 border-t border-border bg-background/95 p-4 md:px-8 backdrop-blur">
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
