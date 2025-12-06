import EditPropertyForm from "@/components/EditPropertyForm";


async function getProperty(id: string) {
  const res = await fetch(`http://localhost:3000/properties/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const property = await getProperty(params.id);

  if (!property) return <div>Không tìm thấy tin đăng!</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <EditPropertyForm initialData={property} />
      </div>
    </div>
  );
}