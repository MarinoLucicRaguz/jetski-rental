// import * as z from "zod";
// import { Controller, useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useState, useTransition } from "react";
// import { getJetskis, getUsers, editLocation } from "@/actions/locationActions"; // Import functions to fetch existing jet skis and users
// import { JetskiSchema } from "@/schemas";
// import { Input } from "../ui/input";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { CardWrapper } from "@/components/auth/card-wrapper"
// import { Button } from "../ui/button";
// import { FormError } from "../form-error";
// import { FormSuccess } from "../form-success";

// export const EditLocationForm = ({ locationId }) => { // Accept locationId as a prop for editing a specific location
//     const [error, setError] = useState<string | undefined>("");
//     const [success, setSuccess] = useState<string | undefined>("");
//     const [isPending, startTransition] = useTransition();
//     const [jetskis, setJetskis] = useState<any[]>([]); // State to store existing jet skis
//     const [users, setUsers] = useState<any[]>([]); // State to store existing users

//     useEffect(() => {
//         // Fetch existing jet skis and users when the component mounts
//         startTransition(() => {
//             getJetskis().then((jetskis) => setJetskis(jetskis));
//             getUsers().then((users) => setUsers(users));
//         });
//     }, []);

//     const form = useForm<z.infer<typeof JetskiSchema>>({
//         resolver: zodResolver(JetskiSchema),
//         defaultValues: {
//             jetski_registration: "",
//             jetski_status: "available",
//             location_id: locationId // Set the location ID as a default value
//         },
//     });

//     const onSubmit = (values: z.infer<typeof JetskiSchema>) => {
//         setError("");
//         setSuccess("");

//         startTransition(() => {
//             // Call a function to edit the location with the submitted values
//             editLocation(locationId, values)
//                 .then((data) => {
//                     setError(data.error),
//                     setSuccess(data.success);
//                 });
//         });
//     };

//     return (
//         <CardWrapper headerLabel="Edit Location" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                     <div className="space-y-4">
//                         <FormField control={form.control} name="jetski_registration" render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Registration</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} disabled={isPending} placeholder="" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )} />
//                     </div>
//                     <FormError message={error} />
//                     <FormSuccess message={success} />
//                     <Button type="submit" className="w-full" disabled={isPending}>Edit Location</Button>
//                 </form>
//             </Form>
//         </CardWrapper>
//     );
// }
