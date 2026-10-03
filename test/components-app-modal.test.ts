/**
 * The dialog relies on the platform rather than a dialog library, so the test
 * checks that the native contract is actually used: `showModal`, `close`, and the
 * `close` event that Escape also triggers.
 */
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AppModal from '@/components/ui/AppModal.vue'
import { resetScrollLock } from '@/composables/useScrollLock'

// happy-dom implements <dialog> but not the modal behaviour, so the two methods
// are spied on at the prototype level.
function patchDialog() {
  const showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  const close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(showModal)
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(close)
  return { showModal, close }
}

// The scroll lock is reference counted module state, so it is shared between cases:
// a dialog left mounted and open keeps the document locked, which is correct
// behaviour and has to be cleaned up here rather than relied upon.
afterEach(resetScrollLock)

describe('AppModal', () => {
  it('opens through showModal, so the browser supplies the focus trap', async () => {
    const { showModal } = patchDialog()
    const wrapper = mount(AppModal, { props: { open: false, label: 'Ship' } })

    expect(showModal).not.toHaveBeenCalled()

    await wrapper.setProps({ open: true })
    await nextTick()
    expect(showModal).toHaveBeenCalledOnce()
  })

  it('emits close when the dialog closes, which covers the Escape key', async () => {
    patchDialog()
    const wrapper = mount(AppModal, { props: { open: true, label: 'Ship' } })
    await nextTick()

    await wrapper.find('dialog').trigger('close')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close from the close button', async () => {
    patchDialog()
    const wrapper = mount(AppModal, { props: { open: true, label: 'Ship' } })
    await nextTick()

    await wrapper.find('.modal__close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('closes on a backdrop click but not on a click inside the body', async () => {
    patchDialog()
    const wrapper = mount(AppModal, { props: { open: true, label: 'Ship' } })
    await nextTick()

    await wrapper.find('.modal__body').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.find('dialog').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('locks the document while open and releases it on close', async () => {
    patchDialog()
    const wrapper = mount(AppModal, { props: { open: false, label: 'Ship' } })
    await nextTick()
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)

    await wrapper.setProps({ open: true })
    await nextTick()
    // `<dialog>` does not stop the page behind it from scrolling; this does.
    expect(document.documentElement.classList.contains('has-overlay')).toBe(true)

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)
  })

  it('releases the document lock if it is unmounted while open', async () => {
    patchDialog()
    const wrapper = mount(AppModal, { props: { open: true, label: 'Ship' } })
    await nextTick()

    wrapper.unmount()
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)
  })

  it('exposes the ship name as the dialog label', async () => {
    patchDialog()
    const wrapper = mount(AppModal, { props: { open: true, label: 'Preussen' } })
    expect(wrapper.find('dialog').attributes('aria-label')).toBe('Preussen')
  })
})
