"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  DollarSign,
  Settings,
  Image as ImageIcon,
  Video,
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "cs", label: "Czech" },
  { code: "pl", label: "Polish" },
  { code: "it", label: "Italian" },
  { code: "es", label: "Spanish" },
  { code: "nl", label: "Dutch" },
  { code: "sk", label: "Slovak" },
  { code: "uk", label: "Ukrainian" },
];

const CATEGORIES = [
  { label: "Coffee Tables", value: "coffee" },
  { label: "Dining Tables", value: "dining" },
  { label: "TV Stands", value: "tv" },
  { label: "Shelving", value: "shelving" },
  { label: "Children's Beds", value: "kids" },
  { label: "Benches", value: "benches" },
  { label: "Oak Chairs", value: "chairs" },
  { label: "Side Tables", value: "side" },
  { label: "Bathroom", value: "bathroom" },
  { label: "Pet Furniture", value: "pets" },
  { label: "Table Legs", value: "legs" },
];

const ROUNDING_RULES = [
  { label: "None", value: "none" },
  { label: "Round to 10", value: "10" },
  { label: "Round to 50", value: "50" },
  { label: "Round to 100", value: "100" },
  { label: "Round to 500", value: "500" },
  { label: "Custom", value: "custom" },
];

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("en");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [eurRate, setEurRate] = useState(25);

  const [formData, setFormData] = useState<any>({
    name: {} as Record<string, string>,
    description: {} as Record<string, string>,
    category: "coffee",
    price_czk: 0,
    price_from: false,
    rounding_rule: "none",
    discount_percent: 0,
    discount_for_members_only: false,
    edge_options: [] as string[],
    shade_options: [] as string[],
    frame_options: [] as string[],
    video_url: "",
    is_active: true,
    in_stock: true,
    photos: [] as string[],
    slug: "",
    ...initialData
  });

  useEffect(() => {
    const names: any = { ...formData.name };
    const descriptions: any = { ...formData.description };
    LANGUAGES.forEach(lang => {
      if (!names[lang.code]) names[lang.code] = initialData?.[`name_${lang.code}`] || "";
      if (!descriptions[lang.code]) descriptions[lang.code] = initialData?.[`description_${lang.code}`] || "";
    });
    setFormData((prev: any) => ({ ...prev, name: names, description: descriptions }));

    const fetchRate = async () => {
      const { data } = await supabase.from('currency_rates').select('rate_to_czk').eq('code', 'EUR').single();
      if (data) setEurRate(Number(data.rate_to_czk));
    };
    fetchRate();
  }, [initialData]);

  const handleMultilingualChange = (lang: string, field: 'name' | 'description', value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value }
    }));
  };

  const calculateEUR = () => {
    let price = formData.price_czk / eurRate;
    const rule = formData.rounding_rule;

    if (rule === "10") price = Math.ceil(price / 10) * 10;
    else if (rule === "50") price = Math.ceil(price / 50) * 50;
    else if (rule === "100") price = Math.ceil(price / 100) * 100;
    else if (rule === "500") price = Math.ceil(price / 500) * 500;

    return Math.round(price);
  };

  const handleToggleOption = (field: 'edge_options' | 'shade_options' | 'frame_options', value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v: string) => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const newPhotos = [...formData.photos];

    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-photos')
          .getPublicUrl(filePath);

        newPhotos.push(publicUrl);
      }

      setFormData((prev: any) => ({ ...prev, photos: newPhotos }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      photos: prev.photos.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave: any = {
        category: formData.category,
        price_czk: formData.price_czk,
        price_from: formData.price_from,
        discount_percent: formData.discount_percent,
        discount_for_members_only: formData.discount_for_members_only,
        edge_options: formData.edge_options,
        shade_options: formData.shade_options,
        frame_options: formData.frame_options,
        video_url: formData.video_url,
        is_active: formData.is_active,
        in_stock: formData.in_stock,
        photos: formData.photos,
        slug: formData.slug || formData.name.en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      };

      LANGUAGES.forEach(lang => {
        dataToSave[`name_${lang.code}`] = formData.name[lang.code];
        dataToSave[`description_${lang.code}`] = formData.description[lang.code];
      });

      if (initialData?.id) {
        const { error } = await supabase.from('products').update(dataToSave).eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([dataToSave]);
        if (error) throw error;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl">
      <div className="bg-white p-8 rounded-2xl border border-warm-mid/10 shadow-sm space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-6 text-charcoal">
            <Languages size={20} />
            <h2 className="font-serif text-xl">Multilingual Content</h2>
          </div>

          <div className="flex overflow-x-auto border-b border-warm-mid/10 no-scrollbar">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveTab(lang.code)}
                className={cn(
                  "px-6 py-3 font-sans text-sm font-medium transition-all border-b-2 whitespace-nowrap",
                  activeTab === lang.code
                    ? "border-oak text-oak bg-oak/5"
                    : "border-transparent text-warm-mid hover:text-charcoal"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-sans font-medium text-warm-mid">Product Name ({activeTab.toUpperCase()})</label>
              <input
                type="text"
                value={formData.name[activeTab] || ""}
                onChange={(e) => handleMultilingualChange(activeTab, 'name', e.target.value)}
                className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl focus:ring-2 focus:ring-oak/20 outline-none font-sans"
                placeholder={`Enter name in ${activeTab}...`}
                required={activeTab === 'en'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-sans font-medium text-warm-mid">Description ({activeTab.toUpperCase()})</label>
              <textarea
                value={formData.description[activeTab] || ""}
                onChange={(e) => handleMultilingualChange(activeTab, 'description', e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl focus:ring-2 focus:ring-oak/20 outline-none font-sans resize-none"
                placeholder={`Enter description in ${activeTab}...`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-charcoal">
              <Settings size={20} />
              <h2 className="font-serif text-xl">General Settings</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-sans font-medium text-warm-mid">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl outline-none font-sans appearance-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-sans font-medium text-warm-mid">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl outline-none font-sans"
                placeholder="e.g. beskydos-coffee-table"
              />
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-12 h-6 rounded-full transition-colors",
                    formData.is_active ? "bg-oak" : "bg-warm-mid/20"
                  )} />
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    formData.is_active ? "right-1" : "left-1"
                  )} />
                </div>
                <span className="font-sans text-sm font-medium text-charcoal">Active</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, in_stock: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-12 h-6 rounded-full transition-colors",
                    formData.in_stock ? "bg-oak" : "bg-warm-mid/20"
                  )} />
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    formData.in_stock ? "right-1" : "left-1"
                  )} />
                </div>
                <span className="font-sans text-sm font-medium text-charcoal">In Stock</span>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-charcoal">
              <DollarSign size={20} />
              <h2 className="font-serif text-xl">Pricing & Discounts</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-sans font-medium text-warm-mid">Price (CZK)</label>
                <input
                  type="number"
                  value={formData.price_czk}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, price_czk: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl outline-none font-sans font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-sans font-medium text-warm-mid">Price (EUR)</label>
                <div className="w-full px-4 py-3 bg-cream/50 border border-warm-mid/10 rounded-xl font-sans font-semibold text-warm-mid">
                  {calculateEUR()} €
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-sans font-medium text-warm-mid">Rounding Rule</label>
                <select
                  value={formData.rounding_rule}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, rounding_rule: e.target.value }))}
                  className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl outline-none font-sans"
                >
                  {ROUNDING_RULES.map(rule => (
                    <option key={rule.value} value={rule.value}>{rule.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-sans font-medium text-warm-mid">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, discount_percent: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl outline-none font-sans"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.price_from}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, price_from: e.target.checked }))}
                  className="w-5 h-5 rounded border-warm-mid/20 text-oak focus:ring-oak/20"
                />
                <span className="font-sans text-sm font-medium text-charcoal">"Price From"</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.discount_for_members_only}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, discount_for_members_only: e.target.checked }))}
                  className="w-5 h-5 rounded border-warm-mid/20 text-oak focus:ring-oak/20"
                />
                <span className="font-sans text-sm font-medium text-charcoal">Members Only Discount</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-charcoal">
            <ImageIcon size={20} />
            <h2 className="font-serif text-xl">Customization Options</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-sans font-bold text-warm-mid uppercase tracking-wider">Edge</h3>
              <div className="space-y-2">
                {['natural', 'straight'].map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.edge_options.includes(opt)}
                      onChange={() => handleToggleOption('edge_options', opt)}
                      className="w-4 h-4 rounded border-warm-mid/20 text-oak focus:ring-oak/20"
                    />
                    <span className="font-sans text-sm text-charcoal capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-sans font-bold text-warm-mid uppercase tracking-wider">Shade</h3>
              <div className="space-y-2">
                {['honey', 'light', 'dark'].map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shade_options.includes(opt)}
                      onChange={() => handleToggleOption('shade_options', opt)}
                      className="w-4 h-4 rounded border-warm-mid/20 text-oak focus:ring-oak/20"
                    />
                    <span className="font-sans text-sm text-charcoal capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-sans font-bold text-warm-mid uppercase tracking-wider">Frame</h3>
              <div className="space-y-2">
                {['black', 'white'].map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.frame_options.includes(opt)}
                      onChange={() => handleToggleOption('frame_options', opt)}
                      className="w-4 h-4 rounded border-warm-mid/20 text-oak focus:ring-oak/20"
                    />
                    <span className="font-sans text-sm text-charcoal capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-charcoal">
            <Video size={20} />
            <h2 className="font-serif text-xl">Media</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-sans font-medium text-warm-mid">Video URL</label>
            <input
              type="text"
              value={formData.video_url}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, video_url: e.target.value }))}
              className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl outline-none font-sans"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formData.photos.map((photo: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-warm-mid/10 group">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <label className={cn(
                "aspect-square rounded-xl border-2 border-dashed border-warm-mid/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-cream/50 transition-colors",
                uploading && "opacity-50 cursor-not-allowed"
              )}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="sr-only"
                />
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-warm-mid">
                  {uploading ? <div className="w-5 h-5 border-2 border-oak border-t-transparent animate-spin rounded-full" /> : <Plus size={20} />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Add Photos</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 rounded-xl font-sans font-medium text-warm-mid hover:bg-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-charcoal hover:bg-charcoal/90 text-white px-10 py-3 rounded-xl font-sans font-medium transition-all shadow-xl disabled:opacity-50"
        >
          {loading ? "Saving..." : <><Save size={20} /> Save Product</>}
        </button>
      </div>
    </form>
  );
}
