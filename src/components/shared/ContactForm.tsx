import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { sendEmail } from "@/lib/emailjs";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .max(255, "Email must be under 255 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2,000 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  /** EmailJS template ID for the contact form */
  templateId: string;
  /** Optional heading above the form */
  heading?: string;
  /** Optional description below the heading */
  description?: string;
  /** Extra template params merged into the send call */
  extraParams?: Record<string, unknown>;
  /** CSS class for the outer wrapper */
  className?: string;
}

export function ContactForm({
  templateId,
  heading = "Get in touch",
  description = "Have a question or feedback? We'd love to hear from you.",
  extraParams,
  className,
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setStatus("sending");
    try {
      await sendEmail(templateId, {
        from_name: values.name,
        from_email: values.email,
        message: values.message,
        ...extraParams,
      });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">
            Message sent!
          </h3>
          <p className="text-sm text-muted-foreground">
            Thanks for reaching out — we'll get back to you soon.
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => setStatus("idle")}
          >
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {heading && (
          <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
        )}
        {description && (
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's on your mind?"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === "error" && (
              <p className="text-sm text-destructive">
                Something went wrong — please try again.
              </p>
            )}

            <Button
              type="submit"
              disabled={status === "sending"}
              className="w-full sm:w-auto"
            >
              {status === "sending" ? (
                "Sending…"
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  Send message
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
