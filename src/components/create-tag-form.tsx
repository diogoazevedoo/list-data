import { Check, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "./ui/button";
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createTagSchema = z.object({
    title: z.string().min(3, { message: 'Tag name should be at least 3 characters long' }),
})

type CreateTagSchema = z.infer<typeof createTagSchema>

function getSlugFromString(input: string): string {
    return input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
}

export function CreateTagForm() {
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>({
    resolver: zodResolver(createTagSchema)
  })

  const slug = watch('title')
   ? getSlugFromString(watch('title')) 
   : ''

  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchema) => {
        await new Promise(resolve => setTimeout(resolve, 2000))

        await fetch('http://localhost:3333/tags', {
            method: 'POST',
            body: JSON.stringify({
                title,
                slug,
                amountOfVideos: 0
            })
        })
    },
    onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: ['get-tags']
        })
    }
  })

  async function createTag({ title }: CreateTagSchema) {
    await mutateAsync({ title })
  }

  return (
    <form onSubmit={handleSubmit(createTag)} className='w-full space-y-6'>
        <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium block'>Tag name</label>
            <input 
                {...register('title')}
                id='name' 
                type="text" 
                className='border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm'
            />
            {formState.errors?.title && <p className='text-red-400 text-sm'>{formState.errors.title.message}</p>}
        </div>
        <div className='space-y-2'>
            <label htmlFor='slug' className='text-sm font-medium block'>Slug</label>
            <input 
                id='slug' 
                type="text" 
                readOnly
                value={slug}
                className='border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm' 
            />
        </div>

        <div className='flex items-center justify-end gap-2'>
            <Dialog.Close asChild>
                <Button>
                    <X className='size-3' />
                    Cancel
                </Button>
            </Dialog.Close>
            <Button disabled={formState.isSubmitting} className='bg-teal-400 text-teal-950' type="submit">
                {formState.isSubmitting ? <Loader2 className='size-3 animate-spin' /> : <Check className='size-3' />}
                Save
            </Button>
        </div>
    </form>
  )
}